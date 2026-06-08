import { DRIVE_API_KEY } from './drive'

/**
 * Хубав глас през Google Cloud Text-to-Speech (neural), с резерв към
 * браузърния SpeechSynthesis, ако Google TTS не е наличен.
 *
 * Ключът е същият публичен ключ (referrer-ограничен до tihstih.eu) — браузърът
 * праща referer автоматично, така че извикването минава директно от клиента.
 * Изисква на проекта на ключа да е включен „Cloud Text-to-Speech API".
 */
const VOICE: Record<'bg' | 'en', { languageCode: string; name?: string }> = {
  bg: { languageCode: 'bg-BG', name: 'bg-BG-Standard-A' },
  en: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
}

const cache = new Map<string, string>()

async function googleTtsDataUrl(text: string, lang: 'bg' | 'en'): Promise<string | null> {
  const ck = lang + '|' + text
  if (cache.has(ck)) return cache.get(ck)!
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${DRIVE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: VOICE[lang],
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95, pitch: 0 },
        }),
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.audioContent) return null
    const url = 'data:audio/mp3;base64,' + data.audioContent
    cache.set(ck, url)
    return url
  } catch {
    return null
  }
}

let current: HTMLAudioElement | null = null

export function stopSpeech() {
  if (current) {
    current.pause()
    current = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Пуска текста на глас. Връща Promise, който се разрешава, когато звукът
 * приключи (или веднага при грешка). `onStop` се вика при край/спиране.
 */
export async function speak(text: string, lang: 'bg' | 'en', onStop: () => void): Promise<void> {
  stopSpeech()
  const url = await googleTtsDataUrl(text, lang)
  if (url) {
    const audio = new Audio(url)
    current = audio
    audio.onended = () => {
      if (current === audio) current = null
      onStop()
    }
    audio.onerror = () => {
      if (current === audio) current = null
      fallback(text, lang, onStop)
    }
    try {
      await audio.play()
    } catch {
      fallback(text, lang, onStop)
    }
    return
  }
  fallback(text, lang, onStop)
}

function fallback(text: string, lang: 'bg' | 'en', onStop: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onStop()
    return
  }
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'bg' ? 'bg-BG' : 'en-US'
  u.rate = 0.95
  u.onend = onStop
  u.onerror = onStop
  window.speechSynthesis.speak(u)
}
