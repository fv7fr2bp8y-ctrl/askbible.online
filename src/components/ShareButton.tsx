import { useState } from 'react'
import type { Poem } from '../types'

interface Props {
  poem: Poem
}

/**
 * Споделяне на стих. Използва native Web Share API на телефони,
 * а на десктоп копира линк в клипборда.
 */
export function ShareButton({ poem }: Props) {
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/?stih=${encodeURIComponent(poem.id)}`
  const shareData = {
    title: poem.title,
    text: `„${poem.title}“${poem.author ? ' — ' + poem.author : ''} | Тих Стих`,
    url,
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // Потребителят е отказал споделянето — нищо не правим.
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <button className="share-btn" onClick={handleShare} aria-label="Сподели стиха">
      {copied ? '✓ Копирано' : '↗ Сподели'}
    </button>
  )
}
