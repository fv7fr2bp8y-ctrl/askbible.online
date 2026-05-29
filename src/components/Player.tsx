import type { Poem } from '../types'
import { ShareButton } from './ShareButton'
import { assetUrl } from '../lib/asset'

interface Props {
  current: Poem | null
  isPlaying: boolean
  progress: number
  duration: number
  onToggle: () => void
  onSeek: (seconds: number) => void
}

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Лентата "сега се възпроизвежда", закотвена долу. */
export function Player({ current, isPlaying, progress, duration, onToggle, onSeek }: Props) {
  if (!current) return null

  return (
    <div className="player">
      {current.cover && (
        <img className="player-cover" src={assetUrl(current.cover)} alt="" />
      )}
      <div className="player-info">
        <div className="player-title">{current.title}</div>
        {current.author && <div className="player-author">{current.author}</div>}
        <div className="player-bar">
          <span className="player-time">{fmt(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            step={0.1}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Превъртане"
          />
          <span className="player-time">{fmt(duration)}</span>
        </div>
      </div>
      <button className="player-toggle" onClick={onToggle} aria-label={isPlaying ? 'Пауза' : 'Пусни'}>
        {isPlaying ? '❚❚' : '▶'}
      </button>
      <ShareButton poem={current} />
    </div>
  )
}
