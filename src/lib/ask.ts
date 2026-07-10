import { GEMINI_API_KEY, GEMINI_AVAILABLE } from './gemini'
import { assetUrl } from './asset'
import type { Passage, PassageCategory } from '../types'

const MODEL = 'gemini-2.5-flash'

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

const PROMPT: Record<'bg' | 'en', string> = {
  bg:
    'Ти помагаш на човек да намери най-подходящия библейски стих за въпроса, тревогата или ' +
    'чувството, което споделя. Избери РЕАЛЕН, добре известен стих (или до 4 последователни ' +
    'стиха), който съществува в Библията. Използвай ТОЧНО един "code" от списъка с книги. ' +
    'Върни само JSON: {"code":"<code>","chapter":<число>,"verseStart":<число>,"verseEnd":<число>}\n\n' +
    'Книги (code: българско име):\n',
  en:
    'You help a person find the most fitting Bible verse for the question, worry, or feeling ' +
    'they share. Choose a REAL, well-known verse (or up to 4 consecutive verses) that actually ' +
    'exists in the Bible. Use EXACTLY one "code" from the book list. ' +
    'Return only JSON: {"code":"<code>","chapter":<number>,"verseStart":<number>,"verseEnd":<number>}\n\n' +
    'Books (code: English name):\n',
}

async function askGemini(question: string, lang: 'bg' | 'en'): Promise<{ code: string; chapter: number; verseStart: number; verseEnd: number } | null> {
  if (!GEMINI_API_KEY) return null
  const books = await loadManifest()
  const list = books.map((b) => `${b.code}: ${lang === 'bg' ? b.bg : b.en}`).join('\n')
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT[lang]}${list}\n\n${lang === 'bg' ? 'Въпрос' : 'Question'}: "${question}"` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const parsed = JSON.parse(text)
    if (!parsed?.code || !parsed?.chapter || !parsed?.verseStart) return null
    return {
      code: String(parsed.code),
      chapter: Number(parsed.chapter),
      verseStart: Number(parsed.verseStart),
      verseEnd: Number(parsed.verseEnd) || Number(parsed.verseStart),
    }
  } catch {
    return null
  }
}

/** Проверява предложената препратка срещу реалния текст и връща Passage, ако е валидна. */
async function resolveReference(ref: { code: string; chapter: number; verseStart: number; verseEnd: number }): Promise<Passage | null> {
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
  return bestScore > 0 ? best : passages[Math.floor(Math.random() * passages.length)]
}

/**
 * Намира най-подходящия стих в ЦЯЛАТА Библия (66 книги) за въпроса.
 * Gemini посочва препратка (книга/глава/стихове), ние взимаме реалния текст
 * от собствения си, проверен набор от данни — никога не показваме
 * измислен/неточен цитат. При неуспех — до 2 опита, после резерв измежду
 * подбраните откъси (офлайн, по ключови думи).
 */
export async function findAnswer(
  question: string,
  fallbackPassages: Passage[],
  lang: 'bg' | 'en',
): Promise<Passage> {
  const q = question.trim()
  if (!q) return fallbackPassages[Math.floor(Math.random() * fallbackPassages.length)]

  for (let attempt = 0; attempt < 2; attempt++) {
    const ref = await askGemini(q, lang)
    if (!ref) continue
    const passage = await resolveReference(ref)
    if (passage) return passage
  }
  return keywordFallback(q, fallbackPassages, lang)
}
