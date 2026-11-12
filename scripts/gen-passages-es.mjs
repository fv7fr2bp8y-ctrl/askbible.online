// Прегенерира src/data/passages.ts на ИСПАНСКИ, като запазва същите подбрани
// референции, но взема текста и имената от новите испански данни.
// Стартирай:  node scripts/gen-passages-es.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const BIBLE_DIR = new URL('../public/bible/', import.meta.url)
const src = readFileSync(new URL('../src/data/passages.ts', import.meta.url), 'utf8')
const start = src.indexOf('[', src.indexOf('= ['))
const arr = JSON.parse(src.slice(start, src.lastIndexOf(']') + 1))

const bookCache = {}
const loadBook = (code) =>
  (bookCache[code] ??= JSON.parse(readFileSync(new URL(`${code}.json`, BIBLE_DIR), 'utf8')))

const out = []
let skipped = 0
for (const p of arr) {
  const book = loadBook(p.book)
  const ch = book.chapters[String(p.chapter)]
  if (!ch) { skipped++; continue }
  const parts = []
  for (let v = p.verseStart; v <= p.verseEnd; v++) {
    const es = ch[String(v)]?.[0]
    if (es) parts.push(es)
  }
  if (parts.length === 0) { skipped++; continue } // няма испански текст → пропускаме
  const range = `${p.chapter}:${p.verseStart}${p.verseEnd > p.verseStart ? '-' + p.verseEnd : ''}`
  out.push({
    id: p.id,
    category: p.category,
    refEs: `${book.es} ${range}`,
    refEn: p.refEn,
    book: p.book,
    chapter: p.chapter,
    verseStart: p.verseStart,
    verseEnd: p.verseEnd,
    es: parts.join(' '),
    en: p.en,
  })
}

const header = `import type { Passage } from '../types'

/**
 * Откъси по категории — за разглеждане и офлайн резерв.
 * ГЕНЕРИРАН ФАЙЛ — не редактирай ръчно (scripts/gen-passages-es.mjs).
 * Текст: Reina-Valera 1909 (public domain) / World English Bible.
 */
export const passages: Passage[] = `
writeFileSync(new URL('../src/data/passages.ts', import.meta.url), header + JSON.stringify(out, null, 2) + '\n')
console.log(`Записани ${out.length} откъса на испански (${skipped} пропуснати).`)
