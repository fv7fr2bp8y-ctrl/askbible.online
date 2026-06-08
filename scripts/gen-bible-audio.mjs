// Предварително генериране на озвучаване за библейските откъси през Gemini TTS
// (управляем глас, чете „спокойно и с благоговение"). Всичко върви през
// generativelanguage.googleapis.com (разрешен хост).
//
// Изисква:
//   - Включен „Generative Language API" на проекта на ключа
//   - GEMINI_API_KEY в средата (НЕ се записва в кода/git!)
//
// Стартирай:
//   GEMINI_API_KEY=... node scripts/gen-bible-audio.mjs sample Iapetus,Charon,Orus,Algenib
//       → проби (един откъс, няколко гласа) в /tmp/bible-sample/
//   GEMINI_API_KEY=... TTS_VOICE=Iapetus node scripts/gen-bible-audio.mjs
//       → всички откъси (BG+EN) в public/audio-bible/<id>.<lang>.mp3
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const lamejs = require('lamejs')

const KEY = process.env.GEMINI_API_KEY
if (!KEY) {
  console.error('Липсва GEMINI_API_KEY.')
  process.exit(1)
}
const MODEL = process.env.TTS_MODEL || 'gemini-2.5-flash-preview-tts'
const VOICE = process.env.TTS_VOICE || 'Iapetus'
const REFERER = 'https://tihstih.eu/'

const STYLE = {
  bg: 'Прочети бавно, спокойно, топло и с благоговение, като свещен текст:',
  en: 'Read slowly, calmly, warmly and with reverence, like a sacred text:',
}

function loadPassages() {
  const src = readFileSync(new URL('../src/data/passages.ts', import.meta.url), 'utf8')
  return JSON.parse(src.slice(src.indexOf('= [') + 2, src.lastIndexOf(']') + 1))
}

function pcmToMp3(pcm, rate) {
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.length / 2))
  const enc = new lamejs.Mp3Encoder(1, rate, 128)
  const out = []
  const block = 1152
  for (let i = 0; i < samples.length; i += block) {
    const buf = enc.encodeBuffer(samples.subarray(i, i + block))
    if (buf.length) out.push(Buffer.from(buf))
  }
  const end = enc.flush()
  if (end.length) out.push(Buffer.from(end))
  return Buffer.concat(out)
}

async function gemini(text, lang, voice) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: REFERER },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${STYLE[lang]} ${text}` }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
    },
  )
  const data = await res.json()
  const p = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!p) throw new Error(data?.error?.message || JSON.stringify(data).slice(0, 160))
  const rate = parseInt((p.mimeType.match(/rate=(\d+)/) || [])[1] || '24000', 10)
  return pcmToMp3(Buffer.from(p.data, 'base64'), rate)
}

const passages = loadPassages()
const mode = process.argv[2]

if (mode === 'sample') {
  const voices = (process.argv[3] || 'Iapetus').split(',')
  const dir = new URL('file:///tmp/bible-sample/')
  mkdirSync(dir, { recursive: true })
  const sample = passages.find((p) => p.id === 'Matt.6.34.34') || passages[0]
  for (const v of voices) {
    try {
      const mp3 = await gemini(sample.bg, 'bg', v.trim())
      writeFileSync(new URL(`${v.trim()}.mp3`, dir), mp3)
      console.log(`✓ ${v.trim()} (${mp3.length} bytes)`)
    } catch (e) {
      console.error(`✗ ${v}: ${e.message}`)
    }
  }
  console.log('Проби в /tmp/bible-sample/')
} else {
  const dir = new URL('../public/audio-bible/', import.meta.url)
  mkdirSync(dir, { recursive: true })
  let done = 0
  for (const p of passages) {
    for (const lang of ['bg', 'en']) {
      const file = new URL(`${p.id}.${lang}.mp3`, dir)
      if (existsSync(file)) continue
      try {
        const mp3 = await gemini(lang === 'bg' ? p.bg : p.en, lang, VOICE)
        writeFileSync(file, mp3)
        done++
        console.log(`✓ ${p.id}.${lang} (${Math.round(mp3.length / 1024)} KB)`)
      } catch (e) {
        console.error(`✗ ${p.id}.${lang}: ${e.message}`)
      }
    }
  }
  console.log(`Готови ${done} файла (глас: ${VOICE}) в public/audio-bible/`)
}
