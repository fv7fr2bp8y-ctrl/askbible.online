// Pipeline за английски гласове през Google Cloud (всичко на *.googleapis.com,
// което вече е разрешено в мрежата — не трябва нова сесия).
//
// За всеки стих: сваля БГ аудио от Drive → Speech-to-Text (БГ текст) →
// Translation (BG→EN) → Text-to-Speech (английско аудио, mp3).
//
// Изисква на проекта да са включени:
//   - Cloud Text-to-Speech API
//   - Cloud Translation API
//   - Cloud Speech-to-Text API
// и ключът (VITE_DRIVE_API_KEY или вградения) да ги разрешава.
//
// Стартирай:
//   node scripts/gen-en-audio.mjs 2            # първите 2 (тест)
//   node scripts/gen-en-audio.mjs <id>         # конкретен стих
//   node scripts/gen-en-audio.mjs              # всички
//
// Изход:
//   public/audio-en/<id>.mp3        — английското аудио
//   scripts/audio-en/<id>.json      — {textBg, textEn} (за преглед/ръчна корекция)
// После:  node scripts/gen-poems.mjs && npm run build
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'

const KEY = process.env.VITE_DRIVE_API_KEY || 'AIzaSyD837Xsi3__ncRI0ZArFHl0F5Yq3M_KvGA'
const REFERER = 'https://tihstih.eu/'
const EN_VOICE = process.env.TTS_VOICE || 'en-US-Neural2-D'

const AUDIO_DIR = new URL('../public/audio-en/', import.meta.url)
const TEXT_DIR = new URL('./audio-en/', import.meta.url)
mkdirSync(AUDIO_DIR, { recursive: true })
mkdirSync(TEXT_DIR, { recursive: true })

const g = (host, path) => `https://${host}.googleapis.com/${path}?key=${KEY}`

async function post(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Referer: REFERER },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${data?.error?.message ?? JSON.stringify(data)}`)
  return data
}

function loadPoems() {
  const src = readFileSync(new URL('../src/data/poems.ts', import.meta.url), 'utf8')
  const re = /\{\s*id:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*author:\s*"([^"]+)"/g
  const out = []
  let m
  while ((m = re.exec(src))) out.push({ id: m[1], title: m[2], author: m[3] })
  return out
}

async function downloadBg(id) {
  const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${KEY}`
  const res = await fetch(url, { headers: { Referer: REFERER } })
  if (!res.ok) throw new Error(`Drive ${id} → HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

// Speech-to-Text (синхронно; за по-дълги файлове ползвай ръчен textBg).
async function transcribe(mp3) {
  const data = await post(g('speech', 'v1/speech:recognize'), {
    config: { encoding: 'MP3', sampleRateHertz: 24000, languageCode: 'bg-BG', enableAutomaticPunctuation: true },
    audio: { content: mp3.toString('base64') },
  })
  return (data.results ?? []).map((r) => r.alternatives?.[0]?.transcript ?? '').join('\n').trim()
}

async function translate(textBg) {
  const data = await post(g('translation', 'language/translate/v2'), {
    q: textBg,
    source: 'bg',
    target: 'en',
    format: 'text',
  })
  return data.data.translations[0].translatedText.trim()
}

async function tts(textEn) {
  const data = await post(g('texttospeech', 'v1/text:synthesize'), {
    input: { text: textEn },
    voice: { languageCode: 'en-US', name: EN_VOICE },
    audioConfig: { audioEncoding: 'MP3', speakingRate: 0.92 },
  })
  return Buffer.from(data.audioContent, 'base64')
}

const all = loadPoems()
const arg = process.argv[2]
let list = all
if (arg && /^\d+$/.test(arg)) list = all.slice(0, Number(arg))
else if (arg) list = all.filter((p) => p.id === arg)

console.log(`Ще обработя ${list.length} стиха (глас: ${EN_VOICE}).`)
let done = 0
for (const p of list) {
  const mp3Path = new URL(`${p.id}.mp3`, AUDIO_DIR)
  const txtPath = new URL(`${p.id}.json`, TEXT_DIR)
  if (existsSync(mp3Path)) {
    console.log(`• пропускам (има): ${p.title}`)
    continue
  }
  try {
    // textBg може да е подаден ръчно (по-точно за дълги стихове).
    let textBg = existsSync(txtPath) ? JSON.parse(readFileSync(txtPath, 'utf8')).textBg : ''
    if (!textBg) {
      const bg = await downloadBg(p.id)
      textBg = await transcribe(bg)
    }
    if (!textBg) {
      console.error(`✗ ${p.title}: празна транскрипция (вероятно >60s — добави ръчно textBg)`)
      continue
    }
    const textEn = await translate(textBg)
    writeFileSync(txtPath, JSON.stringify({ id: p.id, title: p.title, textBg, textEn }, null, 2))
    writeFileSync(mp3Path, await tts(textEn))
    done++
    console.log(`✓ ${p.title} — ${p.author}`)
  } catch (e) {
    console.error(`✗ ${p.title}: ${e.message}`)
  }
}
console.log(`Готови ${done} английски записа в public/audio-en/.`)
console.log('Сега: node scripts/gen-poems.mjs && npm run build')
