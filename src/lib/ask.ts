import { GEMINI_API_KEY, GEMINI_AVAILABLE } from './gemini'
import type { Passage } from '../types'

const MODEL = 'gemini-2.5-flash'

export const ASK_ENABLED = GEMINI_AVAILABLE

const PROMPT: Record<'bg' | 'en', string> = {
  bg:
    'Ти помагаш на човек да намери най-подходящия библейски откъс от списъка по-долу, ' +
    'отговарящ на въпроса, тревогата или чувството, което споделя. ' +
    'Избери ТОЧНО едно ID от списъка — никога не измисляй ID, което го няма в списъка. ' +
    'Върни само JSON: {"id": "<ID от списъка>"}\n\nСписък:\n',
  en:
    'You help a person find the most fitting Bible passage from the list below, ' +
    'matching the question, worry, or feeling they share. ' +
    'Choose EXACTLY one ID from the list — never invent an ID that is not listed. ' +
    'Return only JSON: {"id": "<ID from the list>"}\n\nList:\n',
}

/** Резервен избор по препокриване на думи — ползва се ако AI е недостъпен. */
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

/** Намира най-подходящия откъс за въпроса, измежду подадените. Никога не връща непознат id. */
export async function findAnswer(
  question: string,
  passages: Passage[],
  lang: 'bg' | 'en',
): Promise<Passage> {
  const q = question.trim()
  if (!q) return passages[Math.floor(Math.random() * passages.length)]
  if (!GEMINI_API_KEY) return keywordFallback(q, passages, lang)

  const list = passages.map((p) => `${p.id}: ${lang === 'bg' ? p.bg : p.en}`).join('\n')
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${PROMPT[lang]}${list}\n\n${lang === 'bg' ? 'Въпрос' : 'Question'}: "${q}"` }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      },
    )
    if (!res.ok) return keywordFallback(q, passages, lang)
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    const parsed = text ? JSON.parse(text) : null
    const match = parsed?.id ? passages.find((p) => p.id === parsed.id) : null
    return match ?? keywordFallback(q, passages, lang)
  } catch {
    return keywordFallback(q, passages, lang)
  }
}
