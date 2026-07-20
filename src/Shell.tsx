import { useEffect, useState } from 'react'
import { PoetryApp } from './App'
import { BibleApp } from './BibleApp'
import { Landing } from './Landing'

type Mode = 'bible' | 'poetry'
const MODE_KEY = 'app-mode'
const SEEN_LANDING_KEY = 'seen-landing'

function isStandalonePwa(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
}

function initialShowLanding(): boolean {
  if (typeof window === 'undefined') return false
  // Директен линк за стих или инсталирано приложение — направо в него, без landing.
  if (new URLSearchParams(window.location.search).get('stih')) return false
  if (isStandalonePwa()) return false
  try {
    if (localStorage.getItem(SEEN_LANDING_KEY) === '1') return false
  } catch {
    /* ignore */
  }
  return true
}

function initialMode(): Mode {
  // Споделен линк за стих (/?stih=…) отваря направо „Тих Стих".
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('stih')) {
    return 'poetry'
  }
  try {
    const saved = localStorage.getItem(MODE_KEY)
    if (saved === 'bible' || saved === 'poetry') return saved
  } catch {
    /* ignore */
  }
  return 'bible'
}

export default function Shell() {
  const [showLanding, setShowLanding] = useState(initialShowLanding)
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  function enterApp() {
    try {
      localStorage.setItem(SEEN_LANDING_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowLanding(false)
  }

  if (showLanding) {
    return <Landing onEnterApp={enterApp} />
  }

  return mode === 'bible' ? (
    <BibleApp onToPoetry={() => setMode('poetry')} />
  ) : (
    <PoetryApp onToBible={() => setMode('bible')} />
  )
}
