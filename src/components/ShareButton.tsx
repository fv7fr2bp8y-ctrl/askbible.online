import { useState } from 'react'
import { useI18n } from '../lib/i18n'
import type { Poem } from '../types'

interface Props {
  poem: Poem
}

/**
 * Споделяне на стих. Използва native Web Share API на телефони,
 * а на десктоп копира линк в клипборда.
 */
export function ShareButton({ poem }: Props) {
  const { t, authorName } = useI18n()
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/?stih=${encodeURIComponent(poem.id)}`
  const author = authorName(poem.author)
  const shareData = {
    title: poem.title,
    text: `„${poem.title}“${author ? ' — ' + author : ''} | Тих Стих`,
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
    <button className="share-btn" onClick={handleShare} aria-label={t.shareAria}>
      {copied ? t.copied : t.share}
    </button>
  )
}
