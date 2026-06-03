// Pipeline за английски гласове през OpenAI (само хост api.openai.com).
//
// За всеки стих: сваля БГ аудио от Drive → Whisper транскрипция →
// GPT поетичен превод BG→EN → TTS английско аудио (mp3).
//
// Изисква:
//   1) Мрежова политика, разрешаваща api.openai.com (Network access → Custom)
//   2) OPENAI_API_KEY в средата
//
// Стартирай:
//   OPENAI_API_KEY=sk-... node scripts/gen-en-audio.mjs            # всички
//   OPENAI_API_KEY=sk-... node scripts/gen-en-audio.mjs 5          # първите 5 (тест)
//   OPENAI_API_KEY=sk-... node scripts/gen-en-audio.mjs 19Lbe5...  # конкретен id
//
// Изход:
//   public/audio-en/<id>.mp3              — английското аудио
//   scripts/audio-en/<id>.json           — {textBg, textEn} (за преглед/редакция)
// После:  node scripts/gen-poems.mjs && npm run build   (хваща audio-en автоматично)
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'

const KEY = process.env.OPENAI_API_KEY
if (!KEY) {
  console.error('Липсва OPENAI_API_KEY.')
  process.exit(1)
}
const DRIVE_KEY = process.env.VITE_DRIVE_API_KEY || 'AIzaSyD837Xsi3__ncRI0ZArFHl0F5Yq3M_KvGA'
const VOICE = process.env.TTS_VOICE || 'alloy' // alloy/echo/fable/onyx/nova/shimmer

const AUDIO_DIR = new URL('../public/audio-en/', import.meta.url)
const TEXT_DIR = new URL('./audio-en/', import.meta.url)
mkdirSync(AUDIO_DIR, { recursive: true })
mkdirSync(TEXT_DIR, { recursive: true })

// Парсваме стиховете директно от генерирания src/data/poems.ts.
function loadPoems() {
  const src = readFileSync(new URL('../src/data/poems.ts', import.meta.url), 'utf8')
  const re = /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*author:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src))) out.push({ id: m[1], title: m[2], author: m[3] })
  return out
}

async function openai(path, { method = 'POST', json, form, raw } = {}) {
  const headers = { Authorization: `Bearer ${KEY}` }
  let body
  if (json) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(json)
  } else if (form) {
    body = form
  }
  const res = await fetch(`https://api.openai.com${path}`, { method, headers, body })
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}: ${await res.text()}`)
  return raw ? Buffer.from(await res.arrayBuffer()) : res.json()
}

async function downloadBg(id) {
  // Ключът е referrer-restricted → подаваме Referer на сайта.
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${DRIVE_KEY}`
  const res = await fetch(url, { headers: { Referer: 'https://tihstih.eu/' } })
  if (!res.ok) throw new Error(`Drive ${id} → HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function transcribe(mp3, id) {
  const form = new FormData()
  form.append('file', new Blob([mp3], { type: 'audio/mpeg' }), `${id}.mp3`)
  form.append('model', 'whisper-1')
  form.append('language', 'bg')
  const data = await openai('/v1/audio/transcriptions', { form })
  return data.text.trim()
}

async function translate(textBg, title, author) {
  const data = await openai('/v1/chat/completions', {
    json: {
      model: 'gpt-4o',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are a literary translator of Bulgarian poetry into English. ' +
            'Translate faithfully and poetically, preserving imagery, tone and line breaks. ' +
            'Output ONLY the translated poem, no notes.',
        },
        { role: 'user', content: `Poem: "${title}" by ${author}\n\n${textBg}` },
      ],
    },
  })
  return data.choices[0].message.content.trim()
}

async function tts(textEn) {
  return openai('/v1/audio/speech', {
    json: { model: 'gpt-4o-mini-tts', voice: VOICE, input: textEn, response_format: 'mp3' },
    raw: true,
  })
}

const all = loadPoems()
const arg = process.argv[2]
let list = all
if (arg && /^\d+$/.test(arg)) list = all.slice(0, Number(arg))
else if (arg) list = all.filter((p) => p.id === arg)

console.log(`Ще обработя ${list.length} стиха (глас: ${VOICE}).`)
let done = 0
for (const p of list) {
  const mp3Path = new URL(`${p.id}.mp3`, AUDIO_DIR)
  const txtPath = new URL(`${p.id}.json`, TEXT_DIR)
  if (existsSync(mp3Path)) {
    console.log(`• пропускам (има): ${p.title}`)
    continue
  }
  try {
    const bg = await downloadBg(p.id)
    const textBg = existsSync(txtPath)
      ? JSON.parse(readFileSync(txtPath, 'utf8')).textBg
      : await transcribe(bg, p.id)
    const textEn = await translate(textBg, p.title, p.author)
    writeFileSync(txtPath, JSON.stringify({ id: p.id, title: p.title, textBg, textEn }, null, 2))
    const mp3 = await tts(textEn)
    writeFileSync(mp3Path, mp3)
    done++
    console.log(`✓ ${p.title} — ${p.author}`)
  } catch (e) {
    console.error(`✗ ${p.title}: ${e.message}`)
  }
}
console.log(`Готови ${done} английски записа в public/audio-en/.`)
console.log('Сега: node scripts/gen-poems.mjs && npm run build')
