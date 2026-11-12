import { GEMINI_PROXY_URL, PROXY_AVAILABLE } from './gemini'
import { assetUrl } from './asset'
import type { Passage, PassageCategory } from '../types'

// Lite вариант — без "thinking" режим, ~5x по-бърз за тази проста задача.
const MODEL = 'gemini-flash-lite-latest'
const TIMEOUT_MS = 12_000

export const ASK_ENABLED = PROXY_AVAILABLE

/** Манифест на 66-те книги — {code, es, en, t, chapters}. Зареден веднъж. */
let manifestPromise: Promise<{ code: string; es: string; en: string; t: 'OT' | 'NT'; chapters: number }[]> | null = null
function loadManifest() {
  manifestPromise ??= fetch(assetUrl('/bible/index.json'))
    .then((r) => r.json())
    .then((d) => d.books)
  return manifestPromise
}

interface BookFile {
  es: string
  en: string
  t: 'OT' | 'NT'
  chapters: Record<string, Record<string, [string, string]>>
}

const bookCache = new Map<string, Promise<BookFile | null>>()
function loadBook(code: string): Promise<BookFile | null> {
  if (!bookCache.has(code)) {
    bookCache.set(
      code,
      fetch(assetUrl(`/bible/${code}.json`))
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    )
  }
  return bookCache.get(code)!
}

function deriveCategory(code: string, t: 'OT' | 'NT'): PassageCategory {
  if (code === 'Ps') return 'psalms'
  if (code === 'Prov') return 'proverbs'
  if (['Matt', 'Mark', 'Luke', 'John'].includes(code)) return 'gospels'
  return t === 'NT' ? 'nt' : 'ot'
}

/** Общо извикване на Gemini с JSON схема. Връща разбрания обект или null. */
async function callGemini(prompt: string, schema: object): Promise<Record<string, unknown> | null> {
  if (!GEMINI_PROXY_URL) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`${GEMINI_PROXY_URL}/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer))
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

/* ---------- Paso 1: necesidad + candidatos ---------- */

const CANDIDATE_PROMPT =
  'Una persona te comparte una pregunta, inquietud o sentimiento. NO busques coincidencia ' +
  'literal de palabras (p. ej. "lluvia"→un versículo sobre la lluvia, "sueño"→un versículo ' +
  'sobre dormir) — en vez de eso percibe la necesidad humana más profunda detrás de la ' +
  'pregunta: incertidumbre sobre el futuro, necesidad de paz, confianza, valor, consuelo, ' +
  'esperanza, perdón o gratitud. Incluso una pregunta aparentemente pequeña o cotidiana es ' +
  'ocasión para hallar esa necesidad más profunda — no respondas de forma literal.\n\n' +
  '1) En "need" describe con pocas palabras la necesidad profunda detrás de la pregunta.\n' +
  '2) En "candidates" da 4 versículos bíblicos REALES y bien conocidos (o hasta 4 versículos ' +
  'consecutivos cada uno) que hablen a esa necesidad — ORDENADOS del más adecuado al menos ' +
  'adecuado. Cita solo versículos cuyo CONTENIDO conozcas de verdad — no adivines números. ' +
  'Usa EXACTAMENTE un "code" de la lista para cada uno. No repitas el mismo versículo.\n\n' +
  'Libros (code: nombre en español):\n'

const CANDIDATE_SCHEMA = {
  type: 'object',
  properties: {
    need: { type: 'string' },
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          chapter: { type: 'integer' },
          verseStart: { type: 'integer' },
          verseEnd: { type: 'integer' },
        },
        required: ['code', 'chapter', 'verseStart'],
      },
    },
  },
  required: ['need', 'candidates'],
}

interface RefCore {
  code: string
  chapter: number
  verseStart: number
  verseEnd: number
}

async function askCandidates(question: string): Promise<{ need: string; candidates: RefCore[] } | null> {
  const books = await loadManifest()
  const list = books.map((b) => `${b.code}: ${b.es}`).join('\n')
  const prompt = `${CANDIDATE_PROMPT}${list}\n\nPregunta: "${question}"`
  const parsed = await callGemini(prompt, CANDIDATE_SCHEMA)
  if (!parsed) return null
  const raw: unknown[] = Array.isArray(parsed.candidates) ? parsed.candidates : []
  const candidates: RefCore[] = raw
    .map((c) => c as Record<string, unknown>)
    .filter((c) => c?.code && c?.chapter && c?.verseStart)
    .map((c) => ({
      code: String(c.code),
      chapter: Number(c.chapter),
      verseStart: Number(c.verseStart),
      verseEnd: Number(c.verseEnd) || Number(c.verseStart),
    }))
  if (candidates.length === 0) return null
  return { need: typeof parsed.need === 'string' ? parsed.need : question, candidates }
}

/* ---------- Paso 2: verificación contra el texto real ---------- */

const VERIFY_PROMPT =
  'Aquí están la pregunta de la persona, su necesidad profunda y los textos REALES de varios ' +
  'versículos bíblicos. Juzga por SENTIDO (no por palabras) cuál versículo responde de verdad a ' +
  'la necesidad. En "index" devuelve el número (empezando por 0) del más adecuado, o -1 si ' +
  'NINGUNO encaja realmente. En "reflection" da una reflexión breve y cálida (1-2 frases, ' +
  'tratando de "tú", sin citar el versículo) sobre el versículo elegido, en español. Si index ' +
  'es -1, deja la reflexión vacía.\n\n'

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    index: { type: 'integer' },
    reflection: { type: 'string' },
  },
  required: ['index'],
}

interface Verdict {
  index: number
  reflection?: string
}

async function verifyBest(question: string, need: string, resolved: Passage[]): Promise<Verdict | null> {
  const items = resolved.map((p, i) => `${i}) [${p.refEs}] «${p.es}»`).join('\n')
  const prompt = `${VERIFY_PROMPT}Pregunta: "${question}"\nNecesidad: "${need}"\n\nVersículos:\n${items}`
  const parsed = await callGemini(prompt, VERIFY_SCHEMA)
  if (!parsed || typeof parsed.index !== 'number') return null
  return {
    index: parsed.index,
    reflection: typeof parsed.reflection === 'string' ? parsed.reflection : undefined,
  }
}

/* ---------- Resolución al texto real ---------- */

/** Проверява препратката срещу реалния испански текст и връща Passage, ако е валидна. */
async function resolveReference(ref: RefCore): Promise<Passage | null> {
  const book = await loadBook(ref.code)
  if (!book) return null
  const chapterVerses = book.chapters[String(ref.chapter)]
  if (!chapterVerses) return null
  const v1 = ref.verseStart
  const v2 = Math.min(ref.verseEnd, v1 + 5) // максимум 6 стиха
  const esParts: string[] = []
  const enParts: string[] = []
  for (let v = v1; v <= v2; v++) {
    const pair = chapterVerses[String(v)]
    if (!pair) continue
    if (pair[0]) esParts.push(pair[0])
    if (pair[1]) enParts.push(pair[1])
  }
  if (esParts.length === 0) return null // няма испански текст → не показваме

  const range = `${ref.chapter}:${v1}${v2 > v1 ? '-' + v2 : ''}`
  return {
    id: `${ref.code}.${ref.chapter}.${v1}.${v2}`,
    category: deriveCategory(ref.code, book.t),
    refEs: `${book.es} ${range}`,
    refEn: `${book.en} ${range}`,
    book: ref.code,
    chapter: ref.chapter,
    verseStart: v1,
    verseEnd: v2,
    es: esParts.join(' '),
    en: enParts.join(' '),
  }
}

function withReflection(p: Passage, v?: Verdict): Passage {
  return v?.reflection ? { ...p, reflection: { es: v.reflection } } : p
}

/** Резервен избор по препокриване на думи — измежду подбраните откъси, офлайн. */
function keywordFallback(question: string, passages: Passage[]): Passage {
  const words = question
    .toLowerCase()
    .split(/[^a-záéíóúñü0-9]+/i)
    .filter((w) => w.length > 3)
  let best = passages[0]
  let bestScore = -1
  for (const p of passages) {
    const text = p.es.toLowerCase()
    const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = p
    }
  }
  const chosen = bestScore > 0 ? best : passages[Math.floor(Math.random() * passages.length)]
  return { ...chosen, offline: true }
}

/**
 * Намира най-подходящия испански стих в ЦЯЛАТА Библия за въпроса — двустъпково:
 *  1) Gemini назовава нуждата и дава подредени кандидати.
 *  2) Разрешаваме всеки към РЕАЛНИЯ текст (RV1909) от собствените данни.
 *  3) Връщаме реалните текстове на Gemini, който избира по СМИСЪЛ (или -1 = никой).
 * При „никой" → нов кръг. При технически неуспех — най-добрия по ред. Накрая — офлайн резерв.
 */
export async function findAnswer(question: string, fallbackPassages: Passage[]): Promise<Passage> {
  const q = question.trim()
  if (!q) return fallbackPassages[Math.floor(Math.random() * fallbackPassages.length)]

  for (let attempt = 0; attempt < 2; attempt++) {
    const cand = await askCandidates(q)
    if (!cand) continue

    const resolved: Passage[] = []
    for (const core of cand.candidates) {
      const p = await resolveReference(core)
      if (p && !resolved.some((r) => r.id === p.id)) resolved.push(p)
    }
    if (resolved.length === 0) continue

    const verdict = await verifyBest(q, cand.need, resolved)
    if (!verdict) return resolved[0]
    if (verdict.index >= 0 && verdict.index < resolved.length) {
      return withReflection(resolved[verdict.index], verdict)
    }
    if (attempt === 1) return resolved[0]
  }
  return keywordFallback(q, fallbackPassages)
}
