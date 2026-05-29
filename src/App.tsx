import { useEffect, useMemo, useState } from 'react'
import { albums } from './data/poems'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { ShareButton } from './components/ShareButton'
import type { Poem } from './types'

interface PoemEntry {
  poem: Poem
  categoryId: string
  categoryTitle: string
}

export default function App() {
  const player = useAudioPlayer()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

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

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">Тих Стих</h1>
        <p className="tagline">Намери точните думи</p>
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

  return (
    <article className={`card${isCurrent ? ' is-current' : ''}`}>
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
        <button
          className="play-circle"
          onClick={onPlay}
          aria-label={isCurrent && isPlaying ? 'Пауза' : 'Пусни'}
        >
          {isCurrent && isPlaying ? '❚❚' : '▶'}
        </button>
        <ShareButton poem={poem} />
      </div>
    </article>
  )
}
