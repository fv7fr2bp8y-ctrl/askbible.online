import { useCallback, useEffect, useRef, useState } from 'react'
import type { Poem } from '../types'
import { assetUrl } from '../lib/asset'

/**
 * Управлява един <audio> елемент за цялото приложение.
 * Връща текущия стих, състоянието и функции за управление.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<Poem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  // Създаваме аудио елемента веднъж.
  if (audioRef.current === null && typeof Audio !== 'undefined') {
    audioRef.current = new Audio()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const play = useCallback((poem: Poem) => {
    const audio = audioRef.current
    if (!audio) return

    if (current?.id === poem.id) {
      // Същият стих — превключваме пауза/пускане.
      if (audio.paused) void audio.play()
      else audio.pause()
      return
    }

    setCurrent(poem)
    audio.src = assetUrl(poem.audio)
    audio.currentTime = 0
    void audio.play().catch(() => {
      // Възпроизвеждането може да е блокирано (липсва файл и т.н.).
      setIsPlaying(false)
    })

    // Lock screen / системни контроли (телефон).
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: poem.title,
        artist: poem.author ?? 'Тих Стих',
        artwork: poem.cover ? [{ src: assetUrl(poem.cover) }] : undefined,
      })
    }
  }, [current])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [current])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = seconds
  }, [])

  return { current, isPlaying, progress, duration, play, togglePlay, seek }
}
