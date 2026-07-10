// Извлича ЦЯЛАТА Библия (66 книги, BG+EN) от публично-достъпните източници
// в малки файлове по книга (public/bible/<OSIS>.json) + манифест
// (public/bible/index.json), за да може „Задай въпрос" да търси и цитира
// стих от произволно място в Писанието, не само от подбраните 58 откъса.
//
// Източници (public domain, свалят се ръчно в /tmp преди стартиране):
//   BG: https://raw.githubusercontent.com/seven1m/open-bibles/master/bul-bulgarian.osis.xml
//   EN: https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml
//
// Стартирай:  node scripts/gen-bible-full.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const BG = readFileSync('/tmp/bg.osis.xml', 'utf8')
const EN = readFileSync('/tmp/en.usfx.xml', 'utf8')

// Всичките 66 канонични книги: OSIS код (BG файл) → USFX код (EN файл) + имена.
const BOOKS = {
  Gen: { usfx: 'GEN', bg: 'Битие', en: 'Genesis', t: 'OT' },
  Exod: { usfx: 'EXO', bg: 'Изход', en: 'Exodus', t: 'OT' },
  Lev: { usfx: 'LEV', bg: 'Левит', en: 'Leviticus', t: 'OT' },
  Num: { usfx: 'NUM', bg: 'Числа', en: 'Numbers', t: 'OT' },
  Deut: { usfx: 'DEU', bg: 'Второзаконие', en: 'Deuteronomy', t: 'OT' },
  Josh: { usfx: 'JOS', bg: 'Иисус Навиев', en: 'Joshua', t: 'OT' },
  Judg: { usfx: 'JDG', bg: 'Съдии', en: 'Judges', t: 'OT' },
  Ruth: { usfx: 'RUT', bg: 'Рут', en: 'Ruth', t: 'OT' },
  '1Sam': { usfx: '1SA', bg: '1 Царе', en: '1 Samuel', t: 'OT' },
  '2Sam': { usfx: '2SA', bg: '2 Царе', en: '2 Samuel', t: 'OT' },
  '1Kgs': { usfx: '1KI', bg: '3 Царе', en: '1 Kings', t: 'OT' },
  '2Kgs': { usfx: '2KI', bg: '4 Царе', en: '2 Kings', t: 'OT' },
  '1Chr': { usfx: '1CH', bg: '1 Летописи', en: '1 Chronicles', t: 'OT' },
  '2Chr': { usfx: '2CH', bg: '2 Летописи', en: '2 Chronicles', t: 'OT' },
  Ezra: { usfx: 'EZR', bg: 'Ездра', en: 'Ezra', t: 'OT' },
  Neh: { usfx: 'NEH', bg: 'Неемия', en: 'Nehemiah', t: 'OT' },
  Esth: { usfx: 'EST', bg: 'Естир', en: 'Esther', t: 'OT' },
  Job: { usfx: 'JOB', bg: 'Йов', en: 'Job', t: 'OT' },
  Ps: { usfx: 'PSA', bg: 'Псалми', en: 'Psalms', t: 'OT' },
  Prov: { usfx: 'PRO', bg: 'Притчи', en: 'Proverbs', t: 'OT' },
  Eccl: { usfx: 'ECC', bg: 'Еклисиаст', en: 'Ecclesiastes', t: 'OT' },
  Song: { usfx: 'SNG', bg: 'Песен на песните', en: 'Song of Songs', t: 'OT' },
  Isa: { usfx: 'ISA', bg: 'Исая', en: 'Isaiah', t: 'OT' },
  Jer: { usfx: 'JER', bg: 'Еремия', en: 'Jeremiah', t: 'OT' },
  Lam: { usfx: 'LAM', bg: 'Плачът на Еремия', en: 'Lamentations', t: 'OT' },
  Ezek: { usfx: 'EZK', bg: 'Езекиил', en: 'Ezekiel', t: 'OT' },
  Dan: { usfx: 'DAN', bg: 'Даниил', en: 'Daniel', t: 'OT' },
  Hos: { usfx: 'HOS', bg: 'Осия', en: 'Hosea', t: 'OT' },
  Joel: { usfx: 'JOL', bg: 'Йоил', en: 'Joel', t: 'OT' },
  Amos: { usfx: 'AMO', bg: 'Амос', en: 'Amos', t: 'OT' },
  Obad: { usfx: 'OBA', bg: 'Авдий', en: 'Obadiah', t: 'OT' },
  Jonah: { usfx: 'JON', bg: 'Йона', en: 'Jonah', t: 'OT' },
  Mic: { usfx: 'MIC', bg: 'Михей', en: 'Micah', t: 'OT' },
  Nah: { usfx: 'NAM', bg: 'Наум', en: 'Nahum', t: 'OT' },
  Hab: { usfx: 'HAB', bg: 'Авакум', en: 'Habakkuk', t: 'OT' },
  Zeph: { usfx: 'ZEP', bg: 'Софония', en: 'Zephaniah', t: 'OT' },
  Hag: { usfx: 'HAG', bg: 'Агей', en: 'Haggai', t: 'OT' },
  Zech: { usfx: 'ZEC', bg: 'Захария', en: 'Zechariah', t: 'OT' },
  Mal: { usfx: 'MAL', bg: 'Малахия', en: 'Malachi', t: 'OT' },
  Matt: { usfx: 'MAT', bg: 'Матей', en: 'Matthew', t: 'NT' },
  Mark: { usfx: 'MRK', bg: 'Марко', en: 'Mark', t: 'NT' },
  Luke: { usfx: 'LUK', bg: 'Лука', en: 'Luke', t: 'NT' },
  John: { usfx: 'JHN', bg: 'Йоан', en: 'John', t: 'NT' },
  Acts: { usfx: 'ACT', bg: 'Деяния', en: 'Acts', t: 'NT' },
  Rom: { usfx: 'ROM', bg: 'Римляни', en: 'Romans', t: 'NT' },
  '1Cor': { usfx: '1CO', bg: '1 Коринтяни', en: '1 Corinthians', t: 'NT' },
  '2Cor': { usfx: '2CO', bg: '2 Коринтяни', en: '2 Corinthians', t: 'NT' },
  Gal: { usfx: 'GAL', bg: 'Галатяни', en: 'Galatians', t: 'NT' },
  Eph: { usfx: 'EPH', bg: 'Ефесяни', en: 'Ephesians', t: 'NT' },
  Phil: { usfx: 'PHP', bg: 'Филипяни', en: 'Philippians', t: 'NT' },
  Col: { usfx: 'COL', bg: 'Колосяни', en: 'Colossians', t: 'NT' },
  '1Thess': { usfx: '1TH', bg: '1 Солунци', en: '1 Thessalonians', t: 'NT' },
  '2Thess': { usfx: '2TH', bg: '2 Солунци', en: '2 Thessalonians', t: 'NT' },
  '1Tim': { usfx: '1TI', bg: '1 Тимотей', en: '1 Timothy', t: 'NT' },
  '2Tim': { usfx: '2TI', bg: '2 Тимотей', en: '2 Timothy', t: 'NT' },
  Titus: { usfx: 'TIT', bg: 'Тит', en: 'Titus', t: 'NT' },
  Phlm: { usfx: 'PHM', bg: 'Филимон', en: 'Philemon', t: 'NT' },
  Heb: { usfx: 'HEB', bg: 'Евреи', en: 'Hebrews', t: 'NT' },
  Jas: { usfx: 'JAS', bg: 'Яков', en: 'James', t: 'NT' },
  '1Pet': { usfx: '1PE', bg: '1 Петрово', en: '1 Peter', t: 'NT' },
  '2Pet': { usfx: '2PE', bg: '2 Петрово', en: '2 Peter', t: 'NT' },
  '1John': { usfx: '1JN', bg: '1 Йоаново', en: '1 John', t: 'NT' },
  '2John': { usfx: '2JN', bg: '2 Йоаново', en: '2 John', t: 'NT' },
  '3John': { usfx: '3JN', bg: '3 Йоаново', en: '3 John', t: 'NT' },
  Jude: { usfx: 'JUD', bg: 'Юда', en: 'Jude', t: 'NT' },
  Rev: { usfx: 'REV', bg: 'Откровение', en: 'Revelation', t: 'NT' },
}

const clean = (s) =>
  s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim()

// --- BG: единично преминаване през целия файл, всички <verse> наведнъж. ---
console.log('Парсване на българския текст…')
const bgData = {} // book -> chapter -> verse -> text
{
  const re = /osisID='([A-Za-z0-9]+)\.(\d+)\.(\d+)'>([\s\S]*?)<\/verse>/g
  let m
  let n = 0
  while ((m = re.exec(BG))) {
    const [, book, ch, v, text] = m
    if (!BOOKS[book]) continue
    ;(bgData[book] ??= {})[ch] ??= {}
    bgData[book][ch][v] = clean(text)
    n++
  }
  console.log(`  ${n} стиха`)
}

// --- EN: за всяка книга — линейно сканиране на <c id> / <v id>…<ve/>. ---
console.log('Парсване на английския текст…')
const enData = {} // usfx -> chapter -> verse -> text
{
  const usfxToOsis = Object.fromEntries(Object.entries(BOOKS).map(([osis, m]) => [m.usfx, osis]))
  const bookRe = /<book id="([A-Z0-9]+)">([\s\S]*?)<\/book>/g
  let bm
  let n = 0
  while ((bm = bookRe.exec(EN))) {
    const [, usfx, body] = bm
    const osis = usfxToOsis[usfx]
    if (!osis) continue
    const tokenRe = /<c id="(\d+)"\s*\/>|<v id="(\d+)"\s*\/>([\s\S]*?)<ve\s*\/>/g
    let chapter = '0'
    let tm
    const store = (enData[usfx] ??= {})
    while ((tm = tokenRe.exec(body))) {
      if (tm[1] !== undefined) {
        chapter = tm[1]
      } else {
        const v = tm[2]
        ;(store[chapter] ??= {})[v] = clean(tm[3])
        n++
      }
    }
  }
  console.log(`  ${n} стиха`)
}

// --- Обединяване + запис по книга. ---
mkdirSync(new URL('../public/bible/', import.meta.url), { recursive: true })
const manifest = { books: [] }
let totalVerses = 0

for (const [osis, meta] of Object.entries(BOOKS)) {
  const bg = bgData[osis] ?? {}
  const en = enData[meta.usfx] ?? {}
  const chapters = {}
  let chapterCount = 0
  for (const ch of Object.keys(bg).sort((a, b) => Number(a) - Number(b))) {
    const verses = {}
    for (const v of Object.keys(bg[ch]).sort((a, b) => Number(a) - Number(b))) {
      const bgText = bg[ch][v] ?? ''
      const enText = en[ch]?.[v] ?? ''
      if (!bgText && !enText) continue
      verses[v] = [bgText, enText]
      totalVerses++
    }
    if (Object.keys(verses).length > 0) {
      chapters[ch] = verses
      chapterCount++
    }
  }
  writeFileSync(
    new URL(`${osis}.json`, new URL('../public/bible/', import.meta.url)),
    JSON.stringify({ bg: meta.bg, en: meta.en, t: meta.t, chapters }),
  )
  manifest.books.push({ code: osis, bg: meta.bg, en: meta.en, t: meta.t, chapters: chapterCount })
}

writeFileSync(new URL('../public/bible/index.json', import.meta.url), JSON.stringify(manifest))
console.log(`Записани ${manifest.books.length} книги, ${totalVerses} стиха в public/bible/`)
