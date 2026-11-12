// Прегенерира public/bible/<OSIS>.json + index.json за ИСПАНСКА версия:
//   слот 0 = испански (Reina-Valera 1909, public domain, USFX)
//   слот 1 = наличният английски (World English Bible) от текущите файлове
//
// Източник (сваля се ръчно в /tmp преди стартиране):
//   ES: https://raw.githubusercontent.com/seven1m/open-bibles/master/spa-rv1909.usfx.xml
//
// Стартирай:  node scripts/gen-bible-es.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const ES = readFileSync('/tmp/es.usfx.xml', 'utf8')
const BIBLE_DIR = new URL('../public/bible/', import.meta.url)

// OSIS код → USFX код (ES файл) + испанско/английско име + завет.
const BOOKS = {
  Gen: { usfx: 'GEN', es: 'Génesis', en: 'Genesis', t: 'OT' },
  Exod: { usfx: 'EXO', es: 'Éxodo', en: 'Exodus', t: 'OT' },
  Lev: { usfx: 'LEV', es: 'Levítico', en: 'Leviticus', t: 'OT' },
  Num: { usfx: 'NUM', es: 'Números', en: 'Numbers', t: 'OT' },
  Deut: { usfx: 'DEU', es: 'Deuteronomio', en: 'Deuteronomy', t: 'OT' },
  Josh: { usfx: 'JOS', es: 'Josué', en: 'Joshua', t: 'OT' },
  Judg: { usfx: 'JDG', es: 'Jueces', en: 'Judges', t: 'OT' },
  Ruth: { usfx: 'RUT', es: 'Rut', en: 'Ruth', t: 'OT' },
  '1Sam': { usfx: '1SA', es: '1 Samuel', en: '1 Samuel', t: 'OT' },
  '2Sam': { usfx: '2SA', es: '2 Samuel', en: '2 Samuel', t: 'OT' },
  '1Kgs': { usfx: '1KI', es: '1 Reyes', en: '1 Kings', t: 'OT' },
  '2Kgs': { usfx: '2KI', es: '2 Reyes', en: '2 Kings', t: 'OT' },
  '1Chr': { usfx: '1CH', es: '1 Crónicas', en: '1 Chronicles', t: 'OT' },
  '2Chr': { usfx: '2CH', es: '2 Crónicas', en: '2 Chronicles', t: 'OT' },
  Ezra: { usfx: 'EZR', es: 'Esdras', en: 'Ezra', t: 'OT' },
  Neh: { usfx: 'NEH', es: 'Nehemías', en: 'Nehemiah', t: 'OT' },
  Esth: { usfx: 'EST', es: 'Ester', en: 'Esther', t: 'OT' },
  Job: { usfx: 'JOB', es: 'Job', en: 'Job', t: 'OT' },
  Ps: { usfx: 'PSA', es: 'Salmos', en: 'Psalms', t: 'OT' },
  Prov: { usfx: 'PRO', es: 'Proverbios', en: 'Proverbs', t: 'OT' },
  Eccl: { usfx: 'ECC', es: 'Eclesiastés', en: 'Ecclesiastes', t: 'OT' },
  Song: { usfx: 'SNG', es: 'Cantares', en: 'Song of Songs', t: 'OT' },
  Isa: { usfx: 'ISA', es: 'Isaías', en: 'Isaiah', t: 'OT' },
  Jer: { usfx: 'JER', es: 'Jeremías', en: 'Jeremiah', t: 'OT' },
  Lam: { usfx: 'LAM', es: 'Lamentaciones', en: 'Lamentations', t: 'OT' },
  Ezek: { usfx: 'EZK', es: 'Ezequiel', en: 'Ezekiel', t: 'OT' },
  Dan: { usfx: 'DAN', es: 'Daniel', en: 'Daniel', t: 'OT' },
  Hos: { usfx: 'HOS', es: 'Oseas', en: 'Hosea', t: 'OT' },
  Joel: { usfx: 'JOL', es: 'Joel', en: 'Joel', t: 'OT' },
  Amos: { usfx: 'AMO', es: 'Amós', en: 'Amos', t: 'OT' },
  Obad: { usfx: 'OBA', es: 'Abdías', en: 'Obadiah', t: 'OT' },
  Jonah: { usfx: 'JON', es: 'Jonás', en: 'Jonah', t: 'OT' },
  Mic: { usfx: 'MIC', es: 'Miqueas', en: 'Micah', t: 'OT' },
  Nah: { usfx: 'NAM', es: 'Nahúm', en: 'Nahum', t: 'OT' },
  Hab: { usfx: 'HAB', es: 'Habacuc', en: 'Habakkuk', t: 'OT' },
  Zeph: { usfx: 'ZEP', es: 'Sofonías', en: 'Zephaniah', t: 'OT' },
  Hag: { usfx: 'HAG', es: 'Hageo', en: 'Haggai', t: 'OT' },
  Zech: { usfx: 'ZEC', es: 'Zacarías', en: 'Zechariah', t: 'OT' },
  Mal: { usfx: 'MAL', es: 'Malaquías', en: 'Malachi', t: 'OT' },
  Matt: { usfx: 'MAT', es: 'Mateo', en: 'Matthew', t: 'NT' },
  Mark: { usfx: 'MRK', es: 'Marcos', en: 'Mark', t: 'NT' },
  Luke: { usfx: 'LUK', es: 'Lucas', en: 'Luke', t: 'NT' },
  John: { usfx: 'JHN', es: 'Juan', en: 'John', t: 'NT' },
  Acts: { usfx: 'ACT', es: 'Hechos', en: 'Acts', t: 'NT' },
  Rom: { usfx: 'ROM', es: 'Romanos', en: 'Romans', t: 'NT' },
  '1Cor': { usfx: '1CO', es: '1 Corintios', en: '1 Corinthians', t: 'NT' },
  '2Cor': { usfx: '2CO', es: '2 Corintios', en: '2 Corinthians', t: 'NT' },
  Gal: { usfx: 'GAL', es: 'Gálatas', en: 'Galatians', t: 'NT' },
  Eph: { usfx: 'EPH', es: 'Efesios', en: 'Ephesians', t: 'NT' },
  Phil: { usfx: 'PHP', es: 'Filipenses', en: 'Philippians', t: 'NT' },
  Col: { usfx: 'COL', es: 'Colosenses', en: 'Colossians', t: 'NT' },
  '1Thess': { usfx: '1TH', es: '1 Tesalonicenses', en: '1 Thessalonians', t: 'NT' },
  '2Thess': { usfx: '2TH', es: '2 Tesalonicenses', en: '2 Thessalonians', t: 'NT' },
  '1Tim': { usfx: '1TI', es: '1 Timoteo', en: '1 Timothy', t: 'NT' },
  '2Tim': { usfx: '2TI', es: '2 Timoteo', en: '2 Timothy', t: 'NT' },
  Titus: { usfx: 'TIT', es: 'Tito', en: 'Titus', t: 'NT' },
  Phlm: { usfx: 'PHM', es: 'Filemón', en: 'Philemon', t: 'NT' },
  Heb: { usfx: 'HEB', es: 'Hebreos', en: 'Hebrews', t: 'NT' },
  Jas: { usfx: 'JAS', es: 'Santiago', en: 'James', t: 'NT' },
  '1Pet': { usfx: '1PE', es: '1 Pedro', en: '1 Peter', t: 'NT' },
  '2Pet': { usfx: '2PE', es: '2 Pedro', en: '2 Peter', t: 'NT' },
  '1John': { usfx: '1JN', es: '1 Juan', en: '1 John', t: 'NT' },
  '2John': { usfx: '2JN', es: '2 Juan', en: '2 John', t: 'NT' },
  '3John': { usfx: '3JN', es: '3 Juan', en: '3 John', t: 'NT' },
  Jude: { usfx: 'JUD', es: 'Judas', en: 'Jude', t: 'NT' },
  Rev: { usfx: 'REV', es: 'Apocalipsis', en: 'Revelation', t: 'NT' },
}

const clean = (s) =>
  s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?»])/g, '$1').replace(/([«¿¡])\s+/g, '$1').trim()

// --- ES: сканиране на <c id> / <v id>…<ve/> за всяка книга. ---
console.log('Парсване на испанския текст (RV1909)…')
const esData = {} // usfx -> chapter -> verse -> text
{
  const usfxSet = new Set(Object.values(BOOKS).map((m) => m.usfx))
  const bookRe = /<book id="([A-Z0-9]+)">([\s\S]*?)<\/book>/g
  let bm
  let n = 0
  while ((bm = bookRe.exec(ES))) {
    const [, usfx, body] = bm
    if (!usfxSet.has(usfx)) continue
    const tokenRe = /<c id="(\d+)"\s*\/>|<v id="([\d-]+)"\s*\/>([\s\S]*?)<ve\s*\/>/g
    let chapter = '0'
    let tm
    const store = (esData[usfx] ??= {})
    while ((tm = tokenRe.exec(body))) {
      if (tm[1] !== undefined) {
        chapter = tm[1]
      } else {
        // „12-13" диапазони — вземаме първия номер.
        const v = tm[2].split('-')[0]
        ;(store[chapter] ??= {})[v] = clean(tm[3])
        n++
      }
    }
  }
  console.log(`  ${n} стиха`)
}

// --- Обединяване с наличния английски (слот 1) по книга. ---
const codeByUsfx = Object.fromEntries(Object.entries(BOOKS).map(([osis, m]) => [m.usfx, osis]))
const existing = {} // osis -> chapters {ch:{v:[bg?,en]}}
for (const f of readdirSync(BIBLE_DIR)) {
  if (!f.endsWith('.json') || f === 'index.json') continue
  const osis = f.replace('.json', '')
  if (!BOOKS[osis]) continue
  existing[osis] = JSON.parse(readFileSync(new URL(f, BIBLE_DIR), 'utf8')).chapters ?? {}
}

const manifest = { books: [] }
let totalVerses = 0
let esHits = 0

for (const [osis, meta] of Object.entries(BOOKS)) {
  const es = esData[meta.usfx] ?? {}
  const prev = existing[osis] ?? {}
  // Съюз от глави/стихове на двата източника.
  const chapterNums = new Set([...Object.keys(es), ...Object.keys(prev)])
  const chapters = {}
  let chapterCount = 0
  for (const ch of [...chapterNums].sort((a, b) => Number(a) - Number(b))) {
    const verseNums = new Set([...Object.keys(es[ch] ?? {}), ...Object.keys(prev[ch] ?? {})])
    const verses = {}
    for (const v of [...verseNums].sort((a, b) => Number(a) - Number(b))) {
      const esText = es[ch]?.[v] ?? ''
      const enText = prev[ch]?.[v]?.[1] ?? '' // слот 1 от предишните данни
      if (!esText && !enText) continue
      verses[v] = [esText, enText]
      if (esText) esHits++
      totalVerses++
    }
    if (Object.keys(verses).length > 0) {
      chapters[ch] = verses
      chapterCount++
    }
  }
  writeFileSync(
    new URL(`${osis}.json`, BIBLE_DIR),
    JSON.stringify({ es: meta.es, en: meta.en, t: meta.t, chapters }),
  )
  manifest.books.push({ code: osis, es: meta.es, en: meta.en, t: meta.t, chapters: chapterCount })
}

writeFileSync(new URL('index.json', BIBLE_DIR), JSON.stringify(manifest))
console.log(`Записани ${manifest.books.length} книги, ${totalVerses} стиха (${esHits} с испански текст).`)
