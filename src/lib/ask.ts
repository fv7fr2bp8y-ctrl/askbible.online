import { GEMINI_API_KEY, GEMINI_AVAILABLE } from './gemini'
import { assetUrl } from './asset'
import type { Passage, PassageCategory } from '../types'

// Lite вариант — без "thinking" режим, ~5x по-бърз за тази проста задача
// (класификация към книга/глава/стих), без загуба на точност при теста ни.
const MODEL = 'gemini-flash-lite-latest'
const TIMEOUT_MS = 12_000

export const ASK_ENABLED = GEMINI_AVAILABLE

/** Манифест на 66-те книги — {code, bg, en, t, chapters}. Зареден веднъж. */
let manifestPromise: Promise<{ code: string; bg: string; en: string; t: 'OT' | 'NT'; chapters: number }[]> | null = null
function loadManifest() {
  manifestPromise ??= fetch(assetUrl('/bible/index.json'))
    .then((r) => r.json())
    .then((d) => d.books)
  return manifestPromise
}

interface BookFile {
  bg: string
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
  if (!GEMINI_API_KEY) return null
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: schema },
        }),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timer))
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

/* ---------- Стъпка 1: нужда + кандидати ---------- */

const CANDIDATE_PROMPT: Record<'bg' | 'en', string> = {
  bg:
    'Човек ти споделя въпрос, тревога или чувство. НЕ търси буквално съвпадение на думи ' +
    '(напр. "дъжд"→стих за дъжд, "сън"→стих за сън) — вместо това долови по-дълбоката, ' +
    'човешка нужда зад въпроса: несигурност за бъдещето, нужда от спокойствие, доверие, ' +
    'кураж, утеха, надежда, прошка или благодарност. Дори привидно дребен или битов въпрос ' +
    'е повод да откриеш тази по-дълбока нужда — не отговаряй буквално на въпроса.\n\n' +
    '1) В "need" опиши с няколко думи дълбоката нужда зад въпроса.\n' +
    '2) В "candidates" дай 4 РЕАЛНИ, добре известни библейски стиха (или до 4 последователни ' +
    'стиха всеки), които говорят на тази нужда — ПОДРЕДЕНИ от най-подходящия към по-малко ' +
    'подходящия. Посочвай стихове, чието СЪДЪРЖАНИЕ наистина знаеш — не гадай номера. ' +
    'Използвай ТОЧНО един "code" от списъка за всеки. Не повтаряй един и същ стих.\n\n' +
    'Книги (code: българско име):\n',
  en:
    'A person shares a question, worry, or feeling with you. Do NOT look for literal word ' +
    'matches (e.g. "rain"→a verse about rain, "sleep"→a verse about sleep) — instead sense ' +
    'the deeper human need behind the question: uncertainty about the future, the need for ' +
    'peace, trust, courage, comfort, hope, forgiveness, or gratitude. Even a seemingly small ' +
    'or mundane question is an occasion to find that deeper need — do not answer literally.\n\n' +
    '1) In "need", describe in a few words the deeper need behind the question.\n' +
    '2) In "candidates", give 4 REAL, well-known Bible verses (or up to 4 consecutive verses ' +
    'each) that speak to that need — RANKED from most to least fitting. Only cite verses whose ' +
    'CONTENT you genuinely know — do not guess numbers. Use EXACTLY one "code" from the list ' +
    'for each. Do not repeat the same verse.\n\n' +
    'Books (code: English name):\n',
}

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

async function askCandidates(question: string, lang: 'bg' | 'en'): Promise<{ need: string; candidates: RefCore[] } | null> {
  const books = await loadManifest()
  const list = books.map((b) => `${b.code}: ${lang === 'bg' ? b.bg : b.en}`).join('\n')
  const prompt = `${CANDIDATE_PROMPT[lang]}${list}\n\n${lang === 'bg' ? 'Въпрос' : 'Question'}: "${question}"`
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

/* ---------- Стъпка 2: проверка срещу реалния текст ---------- */

const VERIFY_PROMPT: Record<'bg' | 'en', string> = {
  bg:
    'Ето въпроса на човека, дълбоката му нужда и РЕАЛНИТЕ текстове на няколко библейски стиха. ' +
    'Прецени по СМИСЪЛ (не по думи) кой стих наистина отговаря на нуждата. Върни в "index" ' +
    'номера (започва от 0) на най-подходящия, или -1 ако НИТО ЕДИН не пасва истински. ' +
    'В "reflectionBg"/"reflectionEn" дай кратък, топъл размисъл (1-2 изречения, на "ти", без ' +
    'да цитираш стиха) за избрания стих — на български и английски. При index -1 остави ' +
    'размисъла празен.\n\n',
  en:
    "Here is the person's question, their deeper need, and the REAL texts of several Bible " +
    'verses. Judge by MEANING (not words) which verse truly answers the need. In "index" return ' +
    'the number (starting from 0) of the most fitting one, or -1 if NONE truly fits. In ' +
    '"reflectionBg"/"reflectionEn" give a short, warm reflection (1-2 sentences, addressed to ' +
    '"you", without quoting the verse) for the chosen verse — in Bulgarian and English. If ' +
    'index is -1, leave the reflection empty.\n\n',
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    index: { type: 'integer' },
    reflectionBg: { type: 'string' },
    reflectionEn: { type: 'string' },
  },
  required: ['index'],
}

interface Verdict {
  index: number
  reflectionBg?: string
  reflectionEn?: string
}

async function verifyBest(question: string, need: string, resolved: Passage[], lang: 'bg' | 'en'): Promise<Verdict | null> {
  const items = resolved
    .map((p, i) => `${i}) [${lang === 'bg' ? p.refBg : p.refEn}] „${lang === 'bg' ? p.bg : p.en}"`)
    .join('\n')
  const prompt =
    `${VERIFY_PROMPT[lang]}${lang === 'bg' ? 'Въпрос' : 'Question'}: "${question}"\n` +
    `${lang === 'bg' ? 'Нужда' : 'Need'}: "${need}"\n\n${lang === 'bg' ? 'Стихове' : 'Verses'}:\n${items}`
  const parsed = await callGemini(prompt, VERIFY_SCHEMA)
  if (!parsed || typeof parsed.index !== 'number') return null
  return {
    index: parsed.index,
    reflectionBg: typeof parsed.reflectionBg === 'string' ? parsed.reflectionBg : undefined,
    reflectionEn: typeof parsed.reflectionEn === 'string' ? parsed.reflectionEn : undefined,
  }
}

/* ---------- Разрешаване към реалния текст ---------- */

/** Проверява предложената препратка срещу реалния текст и връща Passage, ако е валидна. */
async function resolveReference(ref: RefCore): Promise<Passage | null> {
  const book = await loadBook(ref.code)
  if (!book) return null
  const chapterVerses = book.chapters[String(ref.chapter)]
  if (!chapterVerses) return null
  const v1 = ref.verseStart
  const v2 = Math.min(ref.verseEnd, v1 + 5) // максимум 6 стиха
  const bgParts: string[] = []
  const enParts: string[] = []
  for (let v = v1; v <= v2; v++) {
    const pair = chapterVerses[String(v)]
    if (!pair) continue
    if (pair[0]) bgParts.push(pair[0])
    if (pair[1]) enParts.push(pair[1])
  }
  if (bgParts.length === 0 && enParts.length === 0) return null

  const range = `${ref.chapter}:${v1}${v2 > v1 ? '-' + v2 : ''}`
  return {
    id: `${ref.code}.${ref.chapter}.${v1}.${v2}`,
    category: deriveCategory(ref.code, book.t),
    refBg: `${book.bg} ${range}`,
    refEn: `${book.en} ${range}`,
    book: ref.code,
    chapter: ref.chapter,
    verseStart: v1,
    verseEnd: v2,
    bg: bgParts.join(' '),
    en: enParts.join(' '),
  }
}

function withReflection(p: Passage, v?: Verdict): Passage {
  return v?.reflectionBg && v?.reflectionEn
    ? { ...p, reflection: { bg: v.reflectionBg, en: v.reflectionEn } }
    : p
}

/** Резервен избор по препокриване на думи — измежду подбраните откъси, офлайн. */
function keywordFallback(question: string, passages: Passage[], lang: 'bg' | 'en'): Passage {
  const words = question
    .toLowerCase()
    .split(/[^a-zа-я0-9]+/i)
    .filter((w) => w.length > 3)
  let best = passages[0]
  let bestScore = -1
  for (const p of passages) {
    const text = (lang === 'bg' ? p.bg : p.en).toLowerCase()
    const score = words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      best = p
    }
  }
  const chosen = bestScore > 0 ? best : passages[Math.floor(Math.random() * passages.length)]
  // Маркираме, че отговорът идва от офлайн резерва (Gemini недостъпен).
  return { ...chosen, offline: true }
}

/**
 * Намира най-подходящия стих в ЦЯЛАТА Библия (66 книги) за въпроса — двустъпково:
 *
 *  1) Gemini назовава дълбоката нужда и дава подредени кандидат-стихове.
 *  2) Разрешаваме всеки към РЕАЛНИЯ текст от собствения си проверен набор.
 *  3) Връщаме реалните текстове обратно на Gemini, който избира по СМИСЪЛ кой
 *     наистина отговаря на нуждата (или -1 = никой) — така изборът се проверява
 *     срещу истинския текст, а не срещу паметта на модела.
 *
 * Ако проверката каже „никой" → нов кръг кандидати. При технически неуспех на
 * проверката ползваме най-добрия кандидат по ред. Накрая — офлайн резерв.
 */
export async function findAnswer(
  question: string,
  fallbackPassages: Passage[],
  lang: 'bg' | 'en',
): Promise<Passage> {
  const q = question.trim()
  if (!q) return fallbackPassages[Math.floor(Math.random() * fallbackPassages.length)]

  for (let attempt = 0; attempt < 2; attempt++) {
    const cand = await askCandidates(q, lang)
    if (!cand) continue

    // Проверка 1: препратката съществува → взимаме реалния текст.
    const resolved: Passage[] = []
    for (const core of cand.candidates) {
      const p = await resolveReference(core)
      if (p && !resolved.some((r) => r.id === p.id)) resolved.push(p)
    }
    if (resolved.length === 0) continue

    // Проверка 2: реалните текстове наистина отговарят на нуждата.
    const verdict = await verifyBest(q, cand.need, resolved, lang)
    if (!verdict) return resolved[0] // проверката се провали технически → най-добрият по ред
    if (verdict.index >= 0 && verdict.index < resolved.length) {
      return withReflection(resolved[verdict.index], verdict)
    }
    // index === -1: нито един не пасва → нов кръг; ако е последен опит — най-добрия по ред.
    if (attempt === 1) return resolved[0]
  }
  return keywordFallback(q, fallbackPassages, lang)
}
