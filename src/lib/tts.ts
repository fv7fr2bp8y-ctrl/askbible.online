import { assetUrl } from './asset'

/**
 * „Чуй" пуска предварително генерирано аудио (статичен файл, най-високо
 * качество, без ключ в приложението). Ако файл липсва — пада на браузърния
 * SpeechSynthesis.
 */
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
 * Пуска озвучаване. `audioPath` е път до предварително генерирания файл
 * (напр. "audio-bible/<id>.bg.mp3") или null. `onStop` се вика при край/спиране.
 */
export async function speak(
  audioPath: string | null,
  text: string,
  lang: 'bg' | 'en',
  onStop: () => void,
): Promise<void> {
  stopSpeech()
  if (audioPath) {
    const audio = new Audio(assetUrl(audioPath))
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
      return
    } catch {
      // Файлът липсва или не може да се пусне — браузърен глас.
    }
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
