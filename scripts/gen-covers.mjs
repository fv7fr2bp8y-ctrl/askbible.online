// Генератор на корици-постери (SVG) за поетите, когато няма истинска снимка.
// Стартирай с:  node scripts/gen-covers.mjs
//
// Всяка корица е топъл градиент в собствения цвят на поета (същия като в
// theme.ts), едър полупрозрачен сериф-монограм и името отдолу. Файловете се
// пазят в public/covers/<id>.svg и се сервират локално от сайта.
import { mkdirSync, writeFileSync } from 'node:fs'

// Същата детерминирана палитра като в src/lib/theme.ts.
function poetTheme(key) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360
  return { c1: `hsl(${h} 38% 56%)`, c2: `hsl(${(h + 28) % 360} 34% 42%)` }
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase()
}

const SERIF = "Georgia, 'Times New Roman', serif"

function cover(name) {
  const { c1, c2 } = poetTheme(name)
  const mono = initials(name)
  const words = name.trim().split(/\s+/)
  // Името — на до два реда (име / фамилия), центрирано.
  const lines =
    words.length >= 2 ? [words[0], words.slice(1).join(' ')] : [words[0]]
  const baseY = lines.length === 2 ? 858 : 884
  const nameSvg = lines
    .map(
      (line, i) =>
        `  <text x="500" y="${baseY + i * 62}" text-anchor="middle" font-family="${SERIF}" font-size="58" font-weight="700" fill="#fff">${line}</text>`,
    )
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="h" cx="0.26" cy="0.2" r="0.95">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="0.62" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#g)"/>
  <rect width="1000" height="1000" fill="url(#h)"/>
  <text x="500" y="160" text-anchor="middle" font-family="${SERIF}" font-size="32" letter-spacing="12" fill="#fff" fill-opacity="0.78">ТИХ СТИХ</text>
  <text x="500" y="600" text-anchor="middle" font-family="${SERIF}" font-size="440" font-weight="700" fill="#fff" fill-opacity="0.15">${mono}</text>
  <line x1="330" y1="772" x2="670" y2="772" stroke="#fff" stroke-opacity="0.55" stroke-width="2"/>
${nameSvg}
</svg>
`
}

// Поетите (id → име) — съвпадат с албумите в gen-poems.mjs.
const poets = [
  ['vazov', 'Иван Вазов'],
  ['yavorov', 'Пейо Яворов'],
  ['smirnenski', 'Христо Смирненски'],
  ['vaptsarov', 'Никола Вапцаров'],
  ['bashev', 'Владимир Башев'],
  ['damyanov', 'Дамян Дамянов'],
  ['germanov', 'Андрей Германов'],
]

const dir = new URL('../public/covers/', import.meta.url)
mkdirSync(dir, { recursive: true })
for (const [id, name] of poets) {
  writeFileSync(new URL(`${id}.svg`, dir), cover(name))
  console.log(`covers/${id}.svg  —  ${name}`)
}
console.log(`Генерирани ${poets.length} корици в public/covers/`)
