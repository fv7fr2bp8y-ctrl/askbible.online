import { useEffect, useMemo, useState } from 'react'
import { albums } from './data/poems'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { Player } from './components/Player'
import { ShareButton } from './components/ShareButton'
import type { Album, Poem } from './types'

export default function App() {
  const player = useAudioPlayer()
  const [openAlbumId, setOpenAlbumId] = useState<string | null>(
    albums.length === 1 ? albums[0].id : null,
  )

  const allPoems = useMemo<Poem[]>(
    () => albums.flatMap((a) => a.poems),
    [],
  )

  // Споделен линк: /?stih=<id> — пуска директно съответния стих.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('stih')
    if (!id) return
    const poem = allPoems.find((p) => p.id === id)
    if (poem) {
      const album = albums.find((a) => a.poems.some((p) => p.id === id))
      if (album) setOpenAlbumId(album.id)
      player.play(poem)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAlbum = albums.find((a) => a.id === openAlbumId) ?? null

  return (
    <div className="app">
      <header className="header">
        <h1 className="brand">Тих&nbsp;Стих</h1>
        <p className="tagline">Записани стихове — слушай, чети и споделяй.</p>
      </header>

      <main className="content">
        {openAlbum ? (
          <AlbumView
            album={openAlbum}
            currentId={player.current?.id ?? null}
            isPlaying={player.isPlaying}
            onBack={albums.length > 1 ? () => setOpenAlbumId(null) : undefined}
            onPlay={player.play}
          />
        ) : (
          <AlbumGrid albums={albums} onOpen={setOpenAlbumId} />
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

function AlbumGrid({ albums, onOpen }: { albums: Album[]; onOpen: (id: string) => void }) {
  return (
    <section className="album-grid">
      <h2 className="section-title">Албуми</h2>
      <div className="grid">
        {albums.map((album) => (
          <button key={album.id} className="album-card" onClick={() => onOpen(album.id)}>
            {album.cover && <img className="album-card-cover" src={album.cover} alt="" />}
            <div className="album-card-title">{album.title}</div>
            {album.description && (
              <div className="album-card-desc">{album.description}</div>
            )}
            <div className="album-card-count">{album.poems.length} стиха</div>
          </button>
        ))}
      </div>
    </section>
  )
}

interface AlbumViewProps {
  album: Album
  currentId: string | null
  isPlaying: boolean
  onBack?: () => void
  onPlay: (poem: Poem) => void
}

function AlbumView({ album, currentId, isPlaying, onBack, onPlay }: AlbumViewProps) {
  const playing = album.poems.find((p) => p.id === currentId) ?? null

  return (
    <section className="album-view">
      {onBack && (
        <button className="back-btn" onClick={onBack}>
          ← Албуми
        </button>
      )}
      <h2 className="section-title">{album.title}</h2>
      {album.description && <p className="album-desc">{album.description}</p>}

      <ul className="poem-list">
        {album.poems.map((poem) => {
          const isCurrent = poem.id === currentId
          return (
            <li key={poem.id} className={`poem-item${isCurrent ? ' is-current' : ''}`}>
              <button className="poem-play" onClick={() => onPlay(poem)} aria-label="Пусни">
                {isCurrent && isPlaying ? '⏸' : '▶'}
              </button>
              {poem.cover && <img className="poem-cover" src={poem.cover} alt="" />}
              <div className="poem-meta">
                <div className="poem-title">{poem.title}</div>
                {poem.author && <div className="poem-author">{poem.author}</div>}
              </div>
              <ShareButton poem={poem} />
            </li>
          )
        })}
      </ul>

      {playing?.text && (
        <article className="poem-text">
          <h3>{playing.title}</h3>
          {playing.text.split('\n').map((line, i) => (
            <p key={i}>{line || ' '}</p>
          ))}
        </article>
      )}
    </section>
  )
}
