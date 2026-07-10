/**
 * „Чуй" — жив синтез през Gemini TTS (управляем глас), за всякакво съдържание.
 *
 * Ключът идва от build env (VITE_TTS_API_KEY), подаден от GitHub Secret — стои
 * само в готовия сайт (referrer-ограничен, като ключ на Google Maps), не в git.
 */
import { GEMINI_API_KEY, GEMINI_AVAILABLE } from './gemini'

const KEY = GEMINI_API_KEY
const MODEL = (import.meta.env.VITE_TTS_MODEL as string | undefined) ?? 'gemini-2.5-flash-preview-tts'
const DEFAULT_VOICE = (import.meta.env.VITE_TTS_VOICE as string | undefined) ?? 'Schedar'

/** Гласове за избор в приложението (Gemini prebuilt). g: пол. */
export const VOICES: { id: string; g: 'm' | 'f' }[] = [
  { id: 'Algenib', g: 'm' },
  { id: 'Charon', g: 'm' },
  { id: 'Iapetus', g: 'm' },
  { id: 'Sadaltager', g: 'm' },
  { id: 'Schedar', g: 'm' },
  { id: 'Aoede', g: 'f' },
  { id: 'Kore', g: 'f' },
  { id: 'Leda', g: 'f' },
  { id: 'Vindemiatrix', g: 'f' },
  { id: 'Despina', g: 'f' },
]

let voiceName = DEFAULT_VOICE
try {
  const saved = localStorage.getItem('tts-voice')
  if (saved) voiceName = saved
} catch {
  /* ignore */
}

/** Дали гласът е наличен (ключът е подаден при билд). */
export const TTS_ENABLED = GEMINI_AVAILABLE

export function getVoice(): string {
  return voiceName
}

export function setVoice(v: string): void {
  voiceName = v
  try {
    localStorage.setItem('tts-voice', v)
  } catch {
    /* ignore */
  }
}

const cache = new Map<string, string>()

function writeStr(dv: DataView, off: number, s: string) {
  for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i))
}

/** Опакова суров PCM (L16 mono) в WAV data URL за <audio>. */
function pcmToWavUrl(pcm: Uint8Array, rate: number): string {
  const buf = new ArrayBuffer(44 + pcm.length)
  const dv = new DataView(buf)
  writeStr(dv, 0, 'RIFF')
  dv.setUint32(4, 36 + pcm.length, true)
  writeStr(dv, 8, 'WAVE')
  writeStr(dv, 12, 'fmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)
  dv.setUint16(22, 1, true)
  dv.setUint32(24, rate, true)
  dv.setUint32(28, rate * 2, true)
  dv.setUint16(32, 2, true)
  dv.setUint16(34, 16, true)
  writeStr(dv, 36, 'data')
  dv.setUint32(40, pcm.length, true)
  new Uint8Array(buf, 44).set(pcm)
  const bytes = new Uint8Array(buf)
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return 'data:audio/wav;base64,' + btoa(bin)
}

async function synthOnce(promptText: string): Promise<{ data: string; mimeType?: string } | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    },
  )
  if (!res.ok) return null
  const data = await res.json()
  const part = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  return part?.data ? part : null
}

async function geminiTts(text: string, lang: 'bg' | 'en'): Promise<string | null> {
  if (!KEY) return null
  const ck = lang + '|' + voiceName + '|' + text
  if (cache.has(ck)) return cache.get(ck)!
  try {
    // Само текстът — най-надеждно (стиловите инструкции карат модела понякога
    // да връща текст вместо аудио). Един повторен опит за всеки случай.
    let part = await synthOnce(text)
    if (!part) part = await synthOnce(text)
    if (!part?.data) return null
    const rate = parseInt((part.mimeType?.match(/rate=(\d+)/) || [])[1] || '24000', 10)
    const raw = atob(part.data)
    const pcm = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) pcm[i] = raw.charCodeAt(i)
    const url = pcmToWavUrl(pcm, rate)
    cache.set(ck, url)
    return url
  } catch {
    return null
  }
}

let current: HTMLAudioElement | null = null

/** Предварително синтезира текста наум (за да е готов при „Чуй"). */
export function prewarm(text: string, lang: 'bg' | 'en'): void {
  void geminiTts(text, lang)
}

export function stopSpeech() {
  if (current) {
    current.pause()
    current = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/** Пуска озвучаване на текста (само Gemini). `onStop` се вика при край/спиране. */
export async function speak(text: string, lang: 'bg' | 'en', onStop: () => void): Promise<void> {
  stopSpeech()
  const url = await geminiTts(text, lang)
  if (!url) {
    onStop()
    return
  }
  const audio = new Audio(url)
  current = audio
  audio.onended = () => {
    if (current === audio) current = null
    onStop()
  }
  audio.onerror = () => {
    if (current === audio) current = null
    onStop()
  }
  try {
    await audio.play()
  } catch {
    onStop()
  }
}
