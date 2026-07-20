import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { passages } from './data/passages'
import { assetUrl } from './lib/asset'
import { useI18n } from './lib/i18n'
import { speak, stopSpeech, prewarm, getVoice, setVoice, VOICES, TTS_ENABLED } from './lib/tts'
import { findAnswer, ASK_ENABLED } from './lib/ask'
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

export function BibleApp() {
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
  const [voice, setVoiceState] = useState<string>(() => getVoice())
  const [question, setQuestion] = useState('')
  const [asking, setAsking] = useState(false)
  const [answered, setAnswered] = useState(false)

  const draw = useCallback(
    (f: Filter) => {
      const next = f === 'all' ? passages : passages.filter((p) => p.category === f)
      setCurrent(pickRandom(next, current?.id))
      setShowContext(false)
      setAnswered(false)
    },
    [current],
  )

  function chooseCategory(f: Filter) {
    setFilter(f)
    draw(f)
  }

  async function askQuestion(e: FormEvent) {
    e.preventDefault()
    const q = question.trim()
    if (!q || asking) return
    setAsking(true)
    try {
      const match = await findAnswer(q, passages, lang)
      setCurrent(match)
      setAnswered(true)
      setShowContext(false)
    } catch {
      // Никога не оставяме потребителя без отговор — резерв при неочаквана грешка.
      setCurrent(pickRandom(passages, current?.id))
      setAnswered(false)
    } finally {
      setAsking(false)
    }
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

  // Предварително синтезираме текущия откъс, та „Чуй" да е мигновено.
  useEffect(() => {
    if (!current || !TTS_ENABLED) return
    const txt = lang === 'bg' ? current.bg : current.en
    const id = setTimeout(() => prewarm(txt, lang), 600)
    return () => clearTimeout(id)
  }, [current, lang, voice])

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

      {ASK_ENABLED && (
        <form className="ask" onSubmit={askQuestion}>
          <input
            className="ask-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={b.askPlaceholder}
            aria-label={b.askAria}
          />
          <button className="ask-btn" type="submit" disabled={asking || !question.trim()}>
            {asking ? b.asking : b.askButton}
          </button>
        </form>
      )}

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
        <p className="passage-intro">{answered ? b.answerIntro : b.openedHere}</p>
        <blockquote className="passage-text">{text}</blockquote>
        <p className="passage-ref">{ref}</p>

        <div className="passage-actions">
          {TTS_ENABLED && <ListenButton text={text} lang={lang} listen={b.listen} stop={b.stop} />}
          <button className="pill" onClick={() => setShowContext(true)}>{b.readContext}</button>
          <button className={`pill${isSaved ? ' is-on' : ''}`} onClick={() => toggleSave(current.id)}>
            {isSaved ? '✓ ' + b.saved : b.save}
          </button>
        </div>
      </section>

      <button className="open-again" onClick={() => draw(filter)}>
        ↻ {b.openAgain}
      </button>

      {TTS_ENABLED && (
      <label className="voice-row">
        <span className="voice-label">🔊 {b.voice}</span>
        <select
          className="voice-select"
          value={voice}
          onChange={(e) => {
            setVoice(e.target.value)
            setVoiceState(e.target.value)
            stopSpeech()
          }}
        >
          {VOICES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id} · {v.g === 'm' ? b.male : b.female}
            </option>
          ))}
        </select>
      </label>
      )}

      <div className="bible-foot">
        <button className="text-btn" onClick={() => setShowSaved(true)}>
          ♡ {b.savedTitle}{saved.length ? ` (${saved.length})` : ''}
        </button>
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
            setAnswered(false)
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

interface BookFile {
  bg: string
  en: string
  t: 'OT' | 'NT'
  chapters: Record<string, Record<string, [string, string]>>
}

function ContextModal({ passage, lang, onClose, closeLabel }: { passage: Passage; lang: string; onClose: () => void; closeLabel: string }) {
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
        .map((v) => ({ v, text: chapterVerses[String(v)][lang === 'bg' ? 0 : 1] }))
    : []
  const ref = data ? `${lang === 'bg' ? data.bg : data.en} ${passage.chapter}` : ''

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
