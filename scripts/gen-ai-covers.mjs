// Генератор на корици-портрети през OpenAI Images API (gpt-image-1).
//
// Изисква:
//   1) Мрежова политика на средата, която разрешава api.openai.com
//   2) Променлива на средата OPENAI_API_KEY
//
// Стартирай с:
//   OPENAI_API_KEY=sk-... node scripts/gen-ai-covers.mjs
//   (по избор: само определени поети)  ... node scripts/gen-ai-covers.mjs vazov yavorov
//
// Записва public/covers/<id>.png (base64 от отговора — без нужда от втори хост).
// После пусни:  node scripts/gen-poems.mjs   (хваща .png автоматично) и билдни.
import { mkdirSync, writeFileSync } from 'node:fs'

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Липсва OPENAI_API_KEY. Пусни: OPENAI_API_KEY=sk-... node scripts/gen-ai-covers.mjs')
  process.exit(1)
}

// Общ стил, за да стоят кориците в един дух с дизайна на „Тих Стих“.
const STYLE =
  'Dignified painterly portrait, head and shoulders, looking slightly off-camera. ' +
  'Warm earthy palette — terracotta (#c0805f), sage green (#8fa47f) and cream (#edebe5). ' +
  'Soft directional studio light, gentle texture like an oil painting, subtle vignette, ' +
  'literary and contemplative mood, neutral muted background, no text, no lettering, ' +
  'square composition with space at the bottom.'

// Поетите: id (= album id), и кратка характеристика за промпта.
const poets = [
  ['vazov', 'Ivan Vazov, the patriarch of Bulgarian literature, dignified elder man with a full grey beard and moustache, 19th-century formal dark suit'],
  ['yavorov', 'Peyo Yavorov, Bulgarian symbolist poet, intense brooding young man, dark hair and moustache, early 20th-century attire'],
  ['smirnenski', 'Hristo Smirnenski, young Bulgarian poet of the 1920s, slim, soulful gentle face, simple jacket, urban early-20th-century mood'],
  ['vaptsarov', 'Nikola Vaptsarov, Bulgarian poet and machinist of the 1940s, open honest face, dark hair, working-man jacket, quiet resolve'],
  ['bashev', 'Vladimir Bashev, Bulgarian poet of the 1950s-60s, youthful thoughtful man, mid-century clothing'],
  ['damyanov', 'Damyan Damyanov, Bulgarian poet, warm expressive mature man, mid-20th-century attire, tender melancholy'],
  ['germanov', 'Andrey Germanov, Bulgarian lyric poet, calm introspective man, mid-20th-century mood'],
]

const want = process.argv.slice(2)
const list = want.length ? poets.filter(([id]) => want.includes(id)) : poets

const dir = new URL('../public/covers/', import.meta.url)
mkdirSync(dir, { recursive: true })

async function genOne(id, subject) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: `${subject}. ${STYLE}`,
      size: '1024x1024',
      n: 1,
    }),
  })
  if (!res.ok) {
    throw new Error(`${id}: HTTP ${res.status} — ${await res.text()}`)
  }
  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error(`${id}: липсва b64_json в отговора`)
  writeFileSync(new URL(`${id}.png`, dir), Buffer.from(b64, 'base64'))
  console.log(`✓ covers/${id}.png`)
}

for (const [id, subject] of list) {
  try {
    await genOne(id, subject)
  } catch (e) {
    console.error(`✗ ${e.message}`)
  }
}
console.log('Готово. Сега: node scripts/gen-poems.mjs && npm run build')
