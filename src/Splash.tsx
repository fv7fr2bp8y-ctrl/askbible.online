import { useEffect, useState } from 'react'
import { assetUrl } from './lib/asset'
import './splash.css'

/**
 * Начален (splash) екран — показва се при отваряне, после плавно избледнява
 * към приложението. Естетика „светлина от отворената книга". Испански.
 */
export function Splash({ onDone }: { onDone: () => void }) {
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
        <div className="splash-eyebrow-top">PREGÚNTALE</div>
        <h1 className="splash-title">A LA BIBLIA</h1>
        <div className="splash-divider">
          <span className="splash-divider-line" />
          <span className="splash-divider-mark">◆</span>
          <span className="splash-divider-line is-right" />
        </div>
        <div className="splash-eyebrow">HAZ TU PREGUNTA</div>
      </div>

      <div className="splash-book">
        <div className="splash-book-glow" aria-hidden />
        <img className="splash-emblem" src={assetUrl('/logo-emblem.png')} alt="" />
      </div>
    </div>
  )
}
