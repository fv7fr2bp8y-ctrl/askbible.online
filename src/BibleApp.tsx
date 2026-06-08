import { useCallback, useEffect, useState } from 'react'
import { passages } from './data/passages'
import { assetUrl } from './lib/asset'
import { useI18n } from './lib/i18n'
import { speak, stopSpeech } from './lib/tts'
import type { Passage, PassageCategory } from './types'

type Filter = PassageCategory | 'all'
const CATS: PassageCategory[] = ['gospels', 'psalms', 'proverbs', 'nt', 'ot']
const SAVED_KEY = 'bible-saved'

function pickRandom(pool: Passage[], notId?: string): Passage | null {
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]
  let p = pool[Math.floor(Math.random() * pool.length)]
  let guard = 0
  while (p.id === notId && guard++ < 8) p = pool[Math.floor(Math.random() * pool.length)]
  return p
}

export function BibleApp({ onToPoetry }: { onToPoetry: () => void }) {
  const { t, lang, toggle } = useI18n()
  const b = t.bible
  const [filter, setFilter] = useState<Filter>('all')
  const [current, setCurrent] = useState<Passage | null>(() => pickRandom(passages))
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [showContext, setShowContext] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const draw = useCallback(
    (f: Filter) => {
      const next = f === 'all' ? passages : passages.filter((p) => p.category === f)
      setCurrent(pickRandom(next, current?.id))
      setShowContext(false)
    },
    [current],
  )

  function chooseCategory(f: Filter) {
    setFilter(f)
    draw(f)
  }

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    } catch {
      /* ignore */
    }
  }, [saved])

  function toggleSave(id: string) {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [id, ...s]))
  }

  if (!current) return null
  const text = lang === 'bg' ? current.bg : current.en
  const ref = lang === 'bg' ? current.refBg : current.refEn
  const isSaved = saved.includes(current.id)

  return (
    <div className="app bible">
      <header className="header">
        <div className="brand-row">
          <img className="brand-logo" src={assetUrl('/logo.svg')} alt="" aria-hidden width={44} height={44} />
          <h1 className="brand">{b.title}</h1>
          <button className="lang-toggle" onClick={toggle} aria-label={lang === 'bg' ? 'Switch to English' : 'Превключи на български'}>
            {t.langName}
          </button>
        </div>
        <p className="tagline">{b.tagline}</p>
      </header>

      <nav className="chips" aria-label={t.categories}>
        <button className={`chip${filter === 'all' ? ' is-active' : ''}`} onClick={() => chooseCategory('all')}>
          {b.surprise}
        </button>
        {CATS.map((c) => (
          <button key={c} className={`chip${filter === c ? ' is-active' : ''}`} onClick={() => chooseCategory(c)}>
            {b.cats[c]}
          </button>
        ))}
      </nav>

      <section className="passage">
        <p className="passage-intro">{b.openedHere}</p>
        <blockquote className="passage-text">{text}</blockquote>
        <p className="passage-ref">{ref}</p>

        <div className="passage-actions">
          <ListenButton text={text} lang={lang} listen={b.listen} stop={b.stop} />
          <button className="pill" onClick={() => setShowContext(true)}>{b.readContext}</button>
          <button className={`pill${isSaved ? ' is-on' : ''}`} onClick={() => toggleSave(current.id)}>
            {isSaved ? '✓ ' + b.saved : b.save}
          </button>
        </div>
      </section>

      <button className="open-again" onClick={() => draw(filter)}>
        ↻ {b.openAgain}
      </button>

      <div className="bible-foot">
        <button className="text-btn" onClick={() => setShowSaved(true)}>
          ♡ {b.savedTitle}{saved.length ? ` (${saved.length})` : ''}
        </button>
        <button className="text-btn" onClick={onToPoetry}>{b.toPoetry} ↗</button>
      </div>

      {showContext && <ContextModal passage={current} lang={lang} onClose={() => setShowContext(false)} closeLabel={b.close} />}
      {showSaved && (
        <SavedModal
          ids={saved}
          lang={lang}
          onClose={() => setShowSaved(false)}
          onOpen={(p) => {
            setCurrent(p)
            setShowSaved(false)
            setShowContext(false)
          }}
          onRemove={toggleSave}
          title={b.savedTitle}
          empty={b.noSaved}
          closeLabel={b.close}
          removeLabel={b.unsave}
        />
      )}
    </div>
  )
}

/** Чете текста на глас — жив Gemini TTS, с резерв браузърния. */
function ListenButton({ text, lang, listen, stop }: { text: string; lang: 'bg' | 'en'; listen: string; stop: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'speaking'>('idle')

  useEffect(() => {
    stopSpeech()
    setState('idle')
  }, [text])

  useEffect(() => () => stopSpeech(), [])

  function toggle() {
    if (state !== 'idle') {
      stopSpeech()
      setState('idle')
      return
    }
    setState('loading')
    void speak(text, lang, () => setState('idle')).then(() => {
      setState((s) => (s === 'loading' ? 'speaking' : s))
    })
  }

  return (
    <button className={`pill${state !== 'idle' ? ' is-on' : ''}`} onClick={toggle}>
      {state === 'loading' ? '… ' + listen : state === 'speaking' ? '❚❚ ' + stop : '▶ ' + listen}
    </button>
  )
}

interface ContextData {
  refBg: string
  refEn: string
  bg: { v: number; text: string }[]
  en: { v: number; text: string }[]
}

function ContextModal({ passage, lang, onClose, closeLabel }: { passage: Passage; lang: string; onClose: () => void; closeLabel: string }) {
  const [data, setData] = useState<ContextData | null>(null)
  const key = `${passage.book}.${passage.chapter}`

  useEffect(() => {
    let alive = true
    fetch(assetUrl('/bible-context.json'))
      .then((r) => r.json())
      .then((all) => {
        if (alive) setData(all[key] ?? null)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [key])

  const verses = data ? (lang === 'bg' ? data.bg : data.en) : []
  const ref = data ? (lang === 'bg' ? data.refBg : data.refEn) : ''

  return (
    <div className="modal" role="dialog" aria-modal onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{ref || '…'}</h2>
          <button className="text-btn" onClick={onClose}>{closeLabel}</button>
        </div>
        <div className="modal-body">
          {!data && <p className="muted">…</p>}
          {verses.map((v) => {
            const active = v.v >= passage.verseStart && v.v <= passage.verseEnd
            return (
              <p key={v.v} className={`ctx-verse${active ? ' is-active' : ''}`}>
                <span className="ctx-num">{v.v}</span> {v.text}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SavedModal({
  ids, lang, onClose, onOpen, onRemove, title, empty, closeLabel, removeLabel,
}: {
  ids: string[]
  lang: string
  onClose: () => void
  onOpen: (p: Passage) => void
  onRemove: (id: string) => void
  title: string
  empty: string
  closeLabel: string
  removeLabel: string
}) {
  const items = ids.map((id) => passages.find((p) => p.id === id)).filter(Boolean) as Passage[]
  return (
    <div className="modal" role="dialog" aria-modal onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="text-btn" onClick={onClose}>{closeLabel}</button>
        </div>
        <div className="modal-body">
          {items.length === 0 && <p className="muted">{empty}</p>}
          {items.map((p) => (
            <div key={p.id} className="saved-item">
              <button className="saved-open" onClick={() => onOpen(p)}>
                <span className="saved-ref">{lang === 'bg' ? p.refBg : p.refEn}</span>
                <span className="saved-text">{(lang === 'bg' ? p.bg : p.en).slice(0, 90)}…</span>
              </button>
              <button className="text-btn" onClick={() => onRemove(p.id)}>{removeLabel}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
