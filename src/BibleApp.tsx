import { useEffect, useState, type FormEvent } from 'react'
import { passages } from './data/passages'
import { assetUrl } from './lib/asset'
import { findAnswer, ASK_ENABLED } from './lib/ask'
import { IconBook, IconHarp, IconScroll, IconFlame, IconDove } from './lib/icons'
import type { Passage, PassageCategory } from './types'
import './landing.css'
import './bible-app.css'

type Screen = 'home' | 'answer' | 'cats'
type Mode = 'ask' | 'browse'

const CAT_ORDER: PassageCategory[] = ['gospels', 'psalms', 'proverbs', 'ot', 'nt']
const CAT_ICON: Record<PassageCategory, () => JSX.Element> = {
  gospels: IconBook,
  psalms: IconHarp,
  proverbs: IconScroll,
  ot: IconFlame,
  nt: IconDove,
}

/** Испански низове за интерфейса (приложението е само на испански). */
const S = {
  eyebrow: 'HAZ TU PREGUNTA',
  title1: 'PREGÚNTALE',
  title2: 'A LA BIBLIA',
  tagline: 'Un versículo para la pregunta que llevas dentro.',
  askPlaceholder: '¿Qué pregunta llevas en el corazón?',
  askAria: 'Haz una pregunta',
  askButton: 'Buscar respuesta',
  asking: 'Buscando…',
  chip1: '¿Cómo encontrar paz?',
  chip2: 'Un versículo para días difíciles',
  chip3: 'Perdón',
  surprise: 'Sorpréndeme',
  back: 'Atrás',
  navHome: 'Inicio',
  navCats: 'Categorías',
  savedTitle: 'Guardados',
  noSaved: 'Aún no tienes versículos guardados.',
  reflectionLabel: 'Reflexión',
  actCopy: 'Copiar',
  actShare: 'Compartir',
  copied: '✓ Copiado',
  save: 'Guardar',
  saved: 'Guardado',
  unsave: 'Quitar',
  close: 'Cerrar',
  openAgain: 'Abrir otro',
  askAnother: 'Hacer otra pregunta',
  offlineNote: '⚠ Modo sin conexión — la búsqueda inteligente no está disponible ahora',
  catsEyebrow: 'EXPLORA',
  catsTitle: 'Categorías',
  cats: { gospels: 'Evangelios', psalms: 'Salmos', proverbs: 'Proverbios', nt: 'Epístolas', ot: 'Profetas' } as Record<PassageCategory, string>,
  catsDesc: {
    gospels: 'La vida y las palabras de Cristo',
    psalms: 'Oraciones, alabanza y consuelo',
    proverbs: 'Sabiduría para cada día',
    nt: 'Guía para una fe viva',
    ot: 'Promesas y esperanza',
  } as Record<PassageCategory, string>,
}

const SAVED_KEY = 'bible-saved'

function pickRandom(pool: Passage[], notId?: string): Passage | null {
  if (pool.length === 0) return null
  if (pool.length === 1) return pool[0]
  let p = pool[Math.floor(Math.random() * pool.length)]
  let guard = 0
  while (p.id === notId && guard++ < 8) p = pool[Math.floor(Math.random() * pool.length)]
  return p
}

export function BibleApp() {
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<Mode>('browse')
  const [current, setCurrent] = useState<Passage | null>(() => pickRandom(passages))
  const [filter, setFilter] = useState<PassageCategory | 'all'>('all')
  const [question, setQuestion] = useState('')
  const [lastQuestion, setLastQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')
    } catch {
      return []
    }
  })
  const [showContext, setShowContext] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

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

  async function submitAsk(raw: string) {
    const q = raw.trim()
    if (!q || asking) return
    setAsking(true)
    try {
      const match = await findAnswer(q, passages)
      setCurrent(match)
      setMode('ask')
      setLastQuestion(q)
      setScreen('answer')
    } catch {
      // Никога не оставяме потребителя без отговор — резерв при неочаквана грешка.
      setCurrent(pickRandom(passages, current?.id))
      setMode('browse')
      setScreen('answer')
    } finally {
      setAsking(false)
    }
  }

  function browseRandom() {
    setCurrent(pickRandom(passages, current?.id))
    setMode('browse')
    setFilter('all')
    setScreen('answer')
  }

  function browseCategory(cat: PassageCategory) {
    const pool = passages.filter((p) => p.category === cat)
    const next = pickRandom(pool)
    if (!next) return
    setCurrent(next)
    setMode('browse')
    setFilter(cat)
    setScreen('answer')
  }

  function openAgain() {
    const pool = filter === 'all' ? passages : passages.filter((p) => p.category === filter)
    setCurrent((c) => pickRandom(pool, c?.id))
  }

  function askAnother() {
    setQuestion('')
    setScreen('home')
  }

  const showBack = screen !== 'home'
  const isSaved = current ? saved.includes(current.id) : false
  const text = current?.es ?? ''
  const ref = current?.refEs ?? ''
  const reflection = current?.reflection?.es ?? null

  return (
    <div className="ba-shell">
      <div className="ba-topbar">
        <div className="ba-topbar-left">
          {showBack && (
            <button className="ba-back" onClick={() => setScreen('home')}>
              <IconChevronLeft />
              {S.back}
            </button>
          )}
        </div>
      </div>

      <div className="ba-body">
        {screen === 'home' && (
          <div className="ba-screen ba-home">
            <div className="ba-home-beam" aria-hidden />
            <div className="ba-home-glow" aria-hidden />
            <div className="ba-home-head">
              <img className="ba-emblem" src={assetUrl('/logo-emblem.png')} alt="" />
              <div className="ba-eyebrow">{S.eyebrow}</div>
              <h1 className="ba-title">
                {S.title1}
                <br />
                {S.title2}
              </h1>
              <div className="ba-divider">
                <span className="ba-divider-line" />
                <span className="ba-divider-mark">◆</span>
                <span className="ba-divider-line is-right" />
              </div>
              <p className="ba-tagline">{S.tagline}</p>
            </div>

            <div className="ba-ask-block">
              {ASK_ENABLED ? (
                <form
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault()
                    void submitAsk(question)
                  }}
                >
                  <div className="ba-ask-card">
                    <IconBulb />
                    <input
                      className="ba-ask-input"
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder={S.askPlaceholder}
                      aria-label={S.askAria}
                    />
                  </div>
                  <div className="ba-chips">
                    {[S.chip1, S.chip2, S.chip3].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="ba-chip"
                        disabled={asking}
                        onClick={() => {
                          setQuestion(chip)
                          void submitAsk(chip)
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <button className="ba-cta" type="submit" disabled={asking || !question.trim()}>
                    {asking ? S.asking : S.askButton}
                  </button>
                </form>
              ) : (
                <button className="ba-cta" onClick={browseRandom}>{S.surprise}</button>
              )}
            </div>
          </div>
        )}

        {screen === 'answer' && current && (
          <div className="ba-screen ba-answer">
            {mode === 'ask' && lastQuestion && (
              <div className="ba-question-row">
                <div className="ba-question-bubble">{lastQuestion}</div>
              </div>
            )}

            {mode === 'ask' && current.offline && <div className="ba-offline-note">{S.offlineNote}</div>}

            <div className="ba-verse-card">
              <div className="ba-verse-glow" aria-hidden />
              <button className="ba-verse-ref-row" onClick={() => setShowContext(true)}>
                <IconSparkle />
                <span className="ba-verse-ref">{ref}</span>
              </button>
              <p className="ba-verse-text">«{text}»</p>
            </div>

            {reflection && (
              <>
                <div className="ba-reflection-label">{S.reflectionLabel}</div>
                <p className="ba-reflection-text">{reflection}</p>
              </>
            )}

            <div className="ba-actions">
              <CopyAction text={`«${text}» — ${ref}`} label={S.actCopy} copiedLabel={S.copied} />
              <ShareAction text={text} verseRef={ref} label={S.actShare} copiedLabel={S.copied} />
              <button className={`ba-action${isSaved ? ' is-on' : ''}`} onClick={() => toggleSave(current.id)}>
                <IconHeart filled={isSaved} />
                {isSaved ? S.saved : S.save}
              </button>
            </div>

            <button className="ba-cta" onClick={mode === 'ask' ? askAnother : openAgain}>
              {mode === 'ask' ? S.askAnother : '↻ ' + S.openAgain}
            </button>
          </div>
        )}

        {screen === 'cats' && (
          <div className="ba-screen ba-cats">
            <div className="lp-section-eyebrow">{S.catsEyebrow}</div>
            <h2 className="lp-section-title">{S.catsTitle}</h2>
            <div className="ba-cats-list">
              {CAT_ORDER.map((c) => {
                const Icon = CAT_ICON[c]
                return (
                  <button key={c} className="lp-cat-card" onClick={() => browseCategory(c)}>
                    <div className="lp-cat-icon"><Icon /></div>
                    <div className="ba-cat-text">
                      <div className="lp-cat-name">{S.cats[c]}</div>
                      <div className="lp-cat-desc">{S.catsDesc[c]}</div>
                    </div>
                    <IconChevronRight className="ba-cat-chevron" />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <nav className="ba-navbar">
        <button className={`ba-nav-btn${screen === 'home' ? ' is-active' : ''}`} onClick={() => setScreen('home')}>
          <IconHome />
          {S.navHome}
        </button>
        <button className={`ba-nav-btn${screen === 'cats' ? ' is-active' : ''}`} onClick={() => setScreen('cats')}>
          <IconGrid />
          {S.navCats}
        </button>
        <button className="ba-nav-btn" onClick={() => setShowSaved(true)}>
          <IconHeart filled={false} />
          {S.savedTitle}{saved.length ? ` (${saved.length})` : ''}
        </button>
      </nav>

      {showContext && current && (
        <ContextModal passage={current} onClose={() => setShowContext(false)} closeLabel={S.close} />
      )}
      {showSaved && (
        <SavedModal
          ids={saved}
          onClose={() => setShowSaved(false)}
          onOpen={(p) => {
            setCurrent(p)
            setMode('browse')
            setShowSaved(false)
            setShowContext(false)
            setScreen('answer')
          }}
          onRemove={toggleSave}
          title={S.savedTitle}
          empty={S.noSaved}
          closeLabel={S.close}
          removeLabel={S.unsave}
        />
      )}
    </div>
  )
}

/* ---------- Икони ---------- */

function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}
function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}
function IconBulb() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 3a5 5 0 0 0-5 5c0 2 1 3 1 5h8c0-2 1-3 1-5a5 5 0 0 0-5-5Z" />
      <path d="M9 20h6M10 18h4" />
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#d7b06c">
      <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.4h7.6z" />
    </svg>
  )
}
function IconCopy() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
  )
}
function IconShare() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </svg>
  )
}
function IconHeart({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#d7b06c' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4 6 4c2.3 0 4 1.4 6 4 2-2.6 3.7-4 6-4 4 0 5.6 4 4 7.7-2.5 4.7-10 9.3-10 9.3z" />
    </svg>
  )
}
function IconHome() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9h14v-9" />
    </svg>
  )
}
function IconGrid() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="15" width="7" height="5" rx="1.5" />
      <rect x="14" y="15" width="7" height="5" rx="1.5" />
    </svg>
  )
}

/* ---------- Acciones bajo el versículo ---------- */

function CopyAction({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }
  return (
    <button className={`ba-action${copied ? ' is-on' : ''}`} onClick={handleCopy}>
      <IconCopy />
      {copied ? copiedLabel : label}
    </button>
  )
}

function ShareAction({ text, verseRef, label, copiedLabel }: { text: string; verseRef: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const shareText = `«${text}» — ${verseRef}`
  const url = window.location.origin

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: verseRef, text: shareText, url })
      } catch {
        // El usuario canceló — no hacemos nada.
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        /* ignore */
      }
    }
  }
  return (
    <button className={`ba-action${copied ? ' is-on' : ''}`} onClick={handleShare}>
      <IconShare />
      {copied ? copiedLabel : label}
    </button>
  )
}

/* ---------- Modales (contexto / guardados) ---------- */

interface BookFile {
  es: string
  en: string
  t: 'OT' | 'NT'
  chapters: Record<string, Record<string, [string, string]>>
}

function ContextModal({ passage, onClose, closeLabel }: { passage: Passage; onClose: () => void; closeLabel: string }) {
  const [data, setData] = useState<BookFile | null>(null)

  useEffect(() => {
    let alive = true
    fetch(assetUrl(`/bible/${passage.book}.json`))
      .then((r) => r.json())
      .then((d) => {
        if (alive) setData(d)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [passage.book])

  const chapterVerses = data?.chapters[String(passage.chapter)] ?? null
  const verses = chapterVerses
    ? Object.keys(chapterVerses)
        .map(Number)
        .sort((a, b) => a - b)
        .map((v) => ({ v, text: chapterVerses[String(v)][0] }))
        .filter((x) => x.text)
    : []
  const ref = data ? `${data.es} ${passage.chapter}` : ''

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
  ids, onClose, onOpen, onRemove, title, empty, closeLabel, removeLabel,
}: {
  ids: string[]
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
                <span className="saved-ref">{p.refEs}</span>
                <span className="saved-text">{p.es.slice(0, 90)}…</span>
              </button>
              <button className="text-btn" onClick={() => onRemove(p.id)}>{removeLabel}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
