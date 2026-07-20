import { useState } from 'react'
import { PoetryApp } from './App'
import { BibleApp } from './BibleApp'
import { Landing } from './Landing'

const SEEN_LANDING_KEY = 'seen-landing'

function isStandalonePwa(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
}

/** Споделен линк за стих (/?stih=…) — отваря направо „Тих Стих". */
function hasSharedPoemLink(): boolean {
  return typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('stih')
}

function initialShowLanding(): boolean {
  if (typeof window === 'undefined') return false
  if (hasSharedPoemLink()) return false
  if (isStandalonePwa()) return false
  try {
    if (localStorage.getItem(SEEN_LANDING_KEY) === '1') return false
  } catch {
    /* ignore */
  }
  return true
}

// „Тих Стих" и „Писание" са отделни продукти — без взаимна навигация. Писание
// е основното приложение; стихове се отварят само през пряк споделен линк.
export default function Shell() {
  const [showLanding, setShowLanding] = useState(initialShowLanding)

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

  return hasSharedPoemLink() ? <PoetryApp /> : <BibleApp />
}
