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

const PROMPT: Record<'bg' | 'en', string> = {
  bg:
    'Човек ти споделя въпрос, тревога или чувство. НЕ търси буквално съвпадение на думи ' +
    '(напр. "дъжд"→стих за дъжд, "сън"→стих за сън) — вместо това долови по-дълбоката, ' +
    'човешка нужда зад въпроса: несигурност за бъдещето, нужда от спокойствие, доверие, ' +
    'кураж, утеха, надежда, прошка или благодарност. Дори привидно дребен или битов въпрос ' +
    'е повод да откриеш тази по-дълбока нужда — не отговаряй буквално на въпроса. Избери ' +
    'РЕАЛЕН, добре известен библейски стих (или до 4 последователни стиха), който говори ' +
    'именно на тази по-дълбока нужда. Използвай ТОЧНО един "code" от списъка с книги. ' +
    'Добави и кратък, топъл размисъл (1-2 изречения, на "ти", без да цитираш стиха отново) ' +
    'за това как човекът да приложи стиха в момента си — на български и на английски. ' +
    'Върни само JSON: {"code":"<code>","chapter":<число>,"verseStart":<число>,"verseEnd":<число>,' +
    '"reflectionBg":"<кратък размисъл на български>","reflectionEn":"<same reflection in English>"}\n\n' +
    'Книги (code: българско име):\n',
  en:
    'A person shares a question, worry, or feeling with you. Do NOT look for literal word ' +
    'matches (e.g. "rain"→a verse about rain, "sleep"→a verse about sleep) — instead sense ' +
    'the deeper human need behind the question: uncertainty about the future, the need for ' +
    'peace, trust, courage, comfort, hope, forgiveness, or gratitude. Even a seemingly small ' +
    'or mundane question is an occasion to find that deeper need — do not answer the question ' +
    'literally. Choose a REAL, well-known Bible verse (or up to 4 consecutive verses) that ' +
    'speaks to that deeper need. Use EXACTLY one "code" from the book list. ' +
    'Also add a short, warm reflection (1-2 sentences, addressed to "you", without quoting the ' +
    'verse again) on how the person can carry it into this moment — in Bulgarian and English. ' +
    'Return only JSON: {"code":"<code>","chapter":<number>,"verseStart":<number>,"verseEnd":<number>,' +
    '"reflectionBg":"<same reflection in Bulgarian>","reflectionEn":"<short reflection in English>"}\n\n' +
    'Books (code: English name):\n',
}

interface GeminiRef {
  code: string
  chapter: number
  verseStart: number
  verseEnd: number
  reflectionBg?: string
  reflectionEn?: string
}

async function askGemini(question: string, lang: 'bg' | 'en'): Promise<GeminiRef | null> {
  if (!GEMINI_API_KEY) return null
  const books = await loadManifest()
  const list = books.map((b) => `${b.code}: ${lang === 'bg' ? b.bg : b.en}`).join('\n')
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT[lang]}${list}\n\n${lang === 'bg' ? 'Въпрос' : 'Question'}: "${question}"` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
        signal: controller.signal,
      },
    ).finally(() => clearTimeout(timer))
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
      reflectionBg: typeof parsed.reflectionBg === 'string' ? parsed.reflectionBg : undefined,
      reflectionEn: typeof parsed.reflectionEn === 'string' ? parsed.reflectionEn : undefined,
    }
  } catch {
    return null
  }
}

/** Проверява предложената препратка срещу реалния текст и връща Passage, ако е валидна. */
async function resolveReference(ref: GeminiRef): Promise<Passage | null> {
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
    reflection:
      ref.reflectionBg && ref.reflectionEn ? { bg: ref.reflectionBg, en: ref.reflectionEn } : undefined,
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
