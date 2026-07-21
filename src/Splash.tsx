import { useEffect, useState } from 'react'
import { assetUrl } from './lib/asset'
import { useI18n } from './lib/i18n'
import './splash.css'

/**
 * Начален (splash) екран — показва се при отваряне, после плавно избледнява
 * към приложението. Възпроизвежда естетиката „светлина от отворената книга".
 * Двуезичен (BG/EN) чрез i18n. Само визуален момент — не блокира зареждането.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useI18n()
  const b = t.bible
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => setLeaving(true), 1500)
    const done = setTimeout(onDone, 2100) // 1500 задържане + 600 избледняване
    return () => {
      clearTimeout(hold)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div
      className={`splash${leaving ? ' is-leaving' : ''}`}
      onClick={() => {
        setLeaving(true)
        setTimeout(onDone, 500)
      }}
    >
      <div className="splash-beam" aria-hidden />
      <div className="splash-rays" aria-hidden />

      <div className="splash-title-wrap">
        <div className="splash-eyebrow-top">{b.title1}</div>
        <h1 className="splash-title">{b.title2}</h1>
        <div className="splash-divider">
          <span className="splash-divider-line" />
          <span className="splash-divider-mark">◆</span>
          <span className="splash-divider-line is-right" />
        </div>
        <div className="splash-eyebrow">{b.eyebrow}!</div>
      </div>

      <div className="splash-book">
        <div className="splash-book-glow" aria-hidden />
        <img className="splash-emblem" src={assetUrl('/logo-emblem.png')} alt="" />
      </div>
    </div>
  )
}
