// Еднократен конвертор: от публично-достъпните Библии (OSIS BG + USFX EN)
// към src/data/passages.ts — подбрани „завършени" откъси по категории.
//
// Източници (public domain, свалят се ръчно в /tmp преди стартиране):
//   BG: https://raw.githubusercontent.com/seven1m/open-bibles/master/bul-bulgarian.osis.xml
//   EN: https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml
//
// Стартирай:  node scripts/gen-bible.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const BG = readFileSync('/tmp/bg.osis.xml', 'utf8')
const EN = readFileSync('/tmp/en.usfx.xml', 'utf8')

// Книги, които ползваме: OSIS код → {usfx, bg, en, testament}.
const BOOKS = {
  Gen: { usfx: 'GEN', bg: 'Битие', en: 'Genesis', t: 'OT' },
  Deut: { usfx: 'DEU', bg: 'Второзаконие', en: 'Deuteronomy', t: 'OT' },
  Josh: { usfx: 'JOS', bg: 'Иисус Навиев', en: 'Joshua', t: 'OT' },
  Ps: { usfx: 'PSA', bg: 'Псалми', en: 'Psalms', t: 'OT' },
  Prov: { usfx: 'PRO', bg: 'Притчи', en: 'Proverbs', t: 'OT' },
  Eccl: { usfx: 'ECC', bg: 'Еклисиаст', en: 'Ecclesiastes', t: 'OT' },
  Isa: { usfx: 'ISA', bg: 'Исая', en: 'Isaiah', t: 'OT' },
  Jer: { usfx: 'JER', bg: 'Еремия', en: 'Jeremiah', t: 'OT' },
  Lam: { usfx: 'LAM', bg: 'Плачът на Еремия', en: 'Lamentations', t: 'OT' },
  Mic: { usfx: 'MIC', bg: 'Михей', en: 'Micah', t: 'OT' },
  Zeph: { usfx: 'ZEP', bg: 'Софония', en: 'Zephaniah', t: 'OT' },
  Matt: { usfx: 'MAT', bg: 'Матей', en: 'Matthew', t: 'NT' },
  Mark: { usfx: 'MRK', bg: 'Марко', en: 'Mark', t: 'NT' },
  Luke: { usfx: 'LUK', bg: 'Лука', en: 'Luke', t: 'NT' },
  John: { usfx: 'JHN', bg: 'Йоан', en: 'John', t: 'NT' },
  Rom: { usfx: 'ROM', bg: 'Римляни', en: 'Romans', t: 'NT' },
  '1Cor': { usfx: '1CO', bg: '1 Коринтяни', en: '1 Corinthians', t: 'NT' },
  Gal: { usfx: 'GAL', bg: 'Галатяни', en: 'Galatians', t: 'NT' },
  Eph: { usfx: 'EPH', bg: 'Ефесяни', en: 'Ephesians', t: 'NT' },
  Phil: { usfx: 'PHP', bg: 'Филипяни', en: 'Philippians', t: 'NT' },
  '2Tim': { usfx: '2TI', bg: '2 Тимотей', en: '2 Timothy', t: 'NT' },
  Heb: { usfx: 'HEB', bg: 'Евреи', en: 'Hebrews', t: 'NT' },
  Jas: { usfx: 'JAS', bg: 'Яков', en: 'James', t: 'NT' },
  '1Pet': { usfx: '1PE', bg: '1 Петрово', en: '1 Peter', t: 'NT' },
  Rev: { usfx: 'REV', bg: 'Откровение', en: 'Revelation', t: 'NT' },
}

const clean = (s) =>
  s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()

// BG OSIS: <verse osisID='John.3.16'>текст</verse>
function bgVerse(osis, ch, v) {
  const re = new RegExp(`osisID='${osis}\\.${ch}\\.${v}'>([\\s\\S]*?)</verse>`)
  const m = BG.match(re)
  return m ? clean(m[1]) : ''
}

// EN USFX: <book id="JHN">…<c id="3"/>…<v id="16"/>текст…(до следващ <v|<c|</book>)
const bookRegions = {}
function enBookRegion(usfx) {
  if (bookRegions[usfx] === undefined) {
    const m = EN.match(new RegExp(`<book id="${usfx}">([\\s\\S]*?)</book>`))
    bookRegions[usfx] = m ? m[1] : ''
  }
  return bookRegions[usfx]
}
function enVerse(usfx, ch, v) {
  const region = enBookRegion(usfx)
  if (!region) return ''
  const cStart = region.search(new RegExp(`<c id="${ch}"\\s*/>`))
  if (cStart < 0) return ''
  const cEnd = region.search(new RegExp(`<c id="${ch + 1}"\\s*/>`))
  const chap = region.slice(cStart, cEnd < 0 ? undefined : cEnd)
  const vStart = chap.search(new RegExp(`<v id="${v}"\\s*/>`))
  if (vStart < 0) return ''
  const after = chap.slice(vStart).replace(new RegExp(`<v id="${v}"\\s*/>`), '')
  const next = after.search(/<v id="\d+"\s*\/>|<c id="\d+"\s*\/>/)
  return clean(next < 0 ? after : after.slice(0, next))
}

function passageText(get, ch, v1, v2) {
  const parts = []
  for (let v = v1; v <= v2; v++) parts.push(get(v))
  return parts.filter(Boolean).join(' ')
}

// Подбрани откъси: [osisBook, ch, v1, v2, category]
// category: gospels | psalms | proverbs | nt | ot
const REFS = [
  // Евангелия
  ['Matt', 6, 34, 34, 'gospels'], ['Matt', 11, 28, 30, 'gospels'],
  ['Matt', 5, 14, 16, 'gospels'], ['Matt', 7, 7, 8, 'gospels'],
  ['John', 3, 16, 16, 'gospels'], ['John', 8, 12, 12, 'gospels'],
  ['John', 14, 27, 27, 'gospels'], ['John', 13, 34, 34, 'gospels'],
  ['John', 16, 33, 33, 'gospels'], ['Luke', 6, 31, 31, 'gospels'],
  ['Mark', 12, 30, 31, 'gospels'], ['Matt', 5, 9, 9, 'gospels'],
  // Псалми
  ['Ps', 23, 1, 4, 'psalms'], ['Ps', 46, 1, 1, 'psalms'],
  ['Ps', 91, 1, 2, 'psalms'], ['Ps', 121, 1, 2, 'psalms'],
  ['Ps', 27, 1, 1, 'psalms'], ['Ps', 34, 18, 18, 'psalms'],
  ['Ps', 51, 10, 10, 'psalms'], ['Ps', 139, 23, 24, 'psalms'],
  ['Ps', 103, 1, 2, 'psalms'], ['Ps', 37, 4, 5, 'psalms'],
  ['Ps', 118, 24, 24, 'psalms'], ['Ps', 19, 1, 1, 'psalms'],
  // Притчи
  ['Prov', 3, 5, 6, 'proverbs'], ['Prov', 16, 3, 3, 'proverbs'],
  ['Prov', 16, 9, 9, 'proverbs'], ['Prov', 17, 22, 22, 'proverbs'],
  ['Prov', 18, 10, 10, 'proverbs'], ['Prov', 27, 17, 17, 'proverbs'],
  ['Prov', 4, 23, 23, 'proverbs'], ['Prov', 15, 1, 1, 'proverbs'],
  ['Prov', 19, 21, 21, 'proverbs'], ['Prov', 3, 3, 4, 'proverbs'],
  // Нов Завет (извън евангелията)
  ['Rom', 8, 28, 28, 'nt'], ['Rom', 12, 2, 2, 'nt'],
  ['1Cor', 13, 4, 7, 'nt'], ['Phil', 4, 6, 7, 'nt'],
  ['Phil', 4, 13, 13, 'nt'], ['Gal', 5, 22, 23, 'nt'],
  ['Eph', 2, 8, 9, 'nt'], ['2Tim', 1, 7, 7, 'nt'],
  ['Heb', 11, 1, 1, 'nt'], ['1Pet', 5, 7, 7, 'nt'],
  ['Jas', 1, 2, 3, 'nt'], ['Rev', 21, 4, 4, 'nt'],
  // Стар Завет (извън Псалми/Притчи)
  ['Gen', 1, 1, 1, 'ot'], ['Isa', 40, 31, 31, 'ot'],
  ['Isa', 41, 10, 10, 'ot'], ['Jer', 29, 11, 11, 'ot'],
  ['Josh', 1, 9, 9, 'ot'], ['Mic', 6, 8, 8, 'ot'],
  ['Eccl', 3, 1, 1, 'ot'], ['Deut', 31, 6, 6, 'ot'],
  ['Lam', 3, 22, 23, 'ot'], ['Isa', 26, 3, 3, 'ot'],
  ['Zeph', 3, 17, 17, 'ot'], ['Ps', 121, 7, 8, 'ot'],
]

const ref = (b, ch, v1, v2) => `${ch}:${v1}${v2 > v1 ? '-' + v2 : ''}`

const passages = []
let missing = 0
for (const [book, ch, v1, v2, category] of REFS) {
  const meta = BOOKS[book]
  if (!meta) { console.error('Няма книга в картата:', book); continue }
  const bg = passageText((v) => bgVerse(book, ch, v), ch, v1, v2)
  const en = passageText((v) => enVerse(meta.usfx, ch, v), ch, v1, v2)
  if (!bg || !en) { console.error(`Празно: ${book} ${ch}:${v1}-${v2}  bg=${!!bg} en=${!!en}`); missing++; continue }
  passages.push({
    id: `${book}.${ch}.${v1}.${v2}`,
    category,
    refBg: `${meta.bg} ${ref(book, ch, v1, v2)}`,
    refEn: `${meta.en} ${ref(book, ch, v1, v2)}`,
    book, chapter: ch, verseStart: v1, verseEnd: v2,
    bg, en,
  })
}

// Забележка: пълният контекст на главите вече се взима от public/bible/<book>.json
// (генериран от scripts/gen-bible-full.mjs), не се генерира тук.

const out = `import type { Passage } from '../types'

/**
 * Подбрани „завършени" откъси от Писанието по категории.
 * ГЕНЕРИРАН ФАЙЛ — не редактирай ръчно (scripts/gen-bible.mjs).
 * Текст: публично достояние — BG „Съвременна библия" (OSIS), EN World English Bible.
 */
export const passages: Passage[] = ${JSON.stringify(passages, null, 2)}
`
mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true })
writeFileSync(new URL('../src/data/passages.ts', import.meta.url), out)
console.log(`Записани ${passages.length} откъса (${missing} липсващи) в src/data/passages.ts`)
