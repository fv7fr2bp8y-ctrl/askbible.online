import { useEffect, useMemo, useState } from 'react'
import { albums } from './data/poems'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { ShareButton } from './components/ShareButton'
import { assetUrl } from './lib/asset'
import { poetTheme, initials } from './lib/theme'
import type { Poem } from './types'

interface PoemEntry {
  poem: Poem
  categoryId: string
  categoryTitle: string
}

export default function App() {
  const player = useAudioPlayer()
  const [query, setQuery] = useState('')
  // Стартираме в секция „Избрано“ (първият албум), не в „Всички“.
  const [category, setCategory] = useState<string>(albums[0]?.id ?? 'all')

  // Плосък списък от всички стихове, всеки с категорията си (албума).
  const entries = useMemo<PoemEntry[]>(
    () =>
      albums.flatMap((a) =>
        a.poems.map((poem) => ({
          poem,
          categoryId: a.id,
          categoryTitle: a.title,
        })),
      ),
    [],
  )

  // Споделен линк: /?stih=<id> — пуска директно съответния стих.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('stih')
    if (!id) return
    const match = entries.find((e) => e.poem.id === id)
    if (match) player.play(match.poem)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = entries.filter((e) => {
    if (category !== 'all' && e.categoryId !== category) return false
    if (!q) return true
    return (
      e.poem.title.toLowerCase().includes(q) ||
      (e.poem.author ?? '').toLowerCase().includes(q) ||
      (e.poem.text ?? '').toLowerCase().includes(q)
    )
  })

  const activeAlbum = category === 'all' ? null : albums.find((a) => a.id === category) ?? null

  // Водещо стихотворение за текущата секция — голямата карта горе.
  // Детерминиран избор по деня от годината: стабилно през деня, ново всеки ден.
  const featured = useMemo<PoemEntry | null>(() => {
    const inCategory =
      category === 'all'
        ? entries.filter((e) => e.categoryId === albums[0]?.id)
        : entries.filter((e) => e.categoryId === category)
    const pool = inCategory.length > 0 ? inCategory : entries
    if (pool.length === 0) return null
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
    return pool[dayOfYear % pool.length]
  }, [category, entries])

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">Тих Стих</h1>
        <p className="tagline">Дневна доза поезия срещу шума на света</p>
      </header>

      <div className="search">
        <span className="search-icon" aria-hidden>⌕</span>
        <input
          type="search"
          placeholder="Какво искаш да чуеш днес?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Търсене"
        />
      </div>

      <nav className="chips" aria-label="Категории">
        <button
          className={`chip${category === 'all' ? ' is-active' : ''}`}
          onClick={() => setCategory('all')}
        >
          Всички
        </button>
        {albums.map((a) => (
          <button
            key={a.id}
            className={`chip${category === a.id ? ' is-active' : ''}`}
            onClick={() => setCategory(a.id)}
          >
            {a.title}
          </button>
        ))}
      </nav>

      {!q && featured && (
        <FeaturedCard
          poem={featured.poem}
          label={category === 'all' ? 'Стих на деня' : activeAlbum?.title ?? featured.categoryTitle}
          albumCover={(activeAlbum ?? albums[0])?.cover}
          isCurrent={player.current?.id === featured.poem.id}
          isPlaying={player.isPlaying}
          onPlay={() => player.play(featured.poem)}
        />
      )}

      <main className="library">
        {filtered.length === 0 ? (
          <p className="empty">Няма намерени стихове.</p>
        ) : (
          filtered.map(({ poem, categoryTitle }) => (
            <PoemCard
              key={poem.id}
              poem={poem}
              category={categoryTitle}
              isCurrent={player.current?.id === poem.id}
              isPlaying={player.isPlaying}
              onPlay={() => player.play(poem)}
            />
          ))
        )}
      </main>

      <Player
        current={player.current}
        isPlaying={player.isPlaying}
        progress={player.progress}
        duration={player.duration}
        onToggle={player.togglePlay}
        onSeek={player.seek}
      />
    </div>
  )
}

/** Голяма, играеща се карта с водещо стихотворение за текущата секция. */
function FeaturedCard({
  poem,
  label,
  albumCover,
  isCurrent,
  isPlaying,
  onPlay,
}: {
  poem: Poem
  label: string
  albumCover?: string
  isCurrent: boolean
  isPlaying: boolean
  onPlay: () => void
}) {
  const th = poetTheme(poem.author ?? label)
  const playing = isCurrent && isPlaying
  const firstLine = poem.text?.split('\n').find((l) => l.trim()) ?? ''
  const cover = poem.cover ?? albumCover

  const style = cover
    ? { backgroundImage: `url(${assetUrl(cover)})` }
    : { background: `linear-gradient(135deg, ${th.c1}, ${th.c2})` }

  return (
    <button
      className={`daily${cover ? ' has-image' : ''}${isCurrent ? ' is-current' : ''}`}
      style={style}
      onClick={onPlay}
      aria-label={playing ? `Пауза — „${poem.title}“` : `Пусни „${poem.title}“`}
    >
      {!cover && <span className="daily-mono">{initials(poem.author ?? label)}</span>}
      <div className="daily-body">
        <span className="daily-kicker">{label}</span>
        <h2 className="daily-title">{poem.title}</h2>
        {poem.author && <p className="daily-author">{poem.author}</p>}
        {firstLine && <p className="daily-quote">„{firstLine}“</p>}
      </div>
      <span className="daily-play" aria-hidden>
        {playing ? '❚❚' : '▶'}
      </span>
    </button>
  )
}

interface CardProps {
  poem: Poem
  category: string
  isCurrent: boolean
  isPlaying: boolean
  onPlay: () => void
}

function lengthLabel(duration?: number): string | null {
  if (!duration) return null
  if (duration < 90) return 'Кратко'
  if (duration < 180) return 'Средно'
  return 'Дълго'
}

function PoemCard({ poem, category, isCurrent, isPlaying, onPlay }: CardProps) {
  // Цитат = първият ред от текста; ако няма — заглавието.
  const firstLine = poem.text?.split('\n').find((l) => l.trim()) ?? ''
  const quote = firstLine || poem.title
  const meta = firstLine
    ? `${poem.title}${poem.author ? ' — ' + poem.author : ''}`
    : poem.author ?? category
  const length = lengthLabel(poem.duration)
  const th = poetTheme(poem.author ?? category)
  const playing = isCurrent && isPlaying

  return (
    <article className={`card${isCurrent ? ' is-current' : ''}`}>
      <button
        className={`card-thumb${poem.cover ? ' has-image' : ''}`}
        onClick={onPlay}
        aria-label={playing ? 'Пауза' : `Пусни „${poem.title}“`}
        style={
          poem.cover
            ? { backgroundImage: `url(${assetUrl(poem.cover)})` }
            : { background: `linear-gradient(135deg, ${th.c1}, ${th.c2})` }
        }
      >
        {!poem.cover && <span className="card-mono">{initials(poem.author ?? category)}</span>}
        <span className="card-thumb-play">{playing ? '❚❚' : '▶'}</span>
      </button>

      <button className="card-main" onClick={onPlay} aria-label={`Пусни „${poem.title}“`}>
        <p className="card-quote">„{quote}“</p>
        <p className="card-meta">{meta}</p>
        <div className="card-footer">
          <div className="tags">
            {(poem.tags ?? []).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
          {length && <span className="card-length">{length}</span>}
        </div>
      </button>

      <div className="card-side">
        <ShareButton poem={poem} />
      </div>
    </article>
  )
}
