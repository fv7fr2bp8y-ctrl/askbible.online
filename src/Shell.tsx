import { useState } from 'react'
import { PoetryApp } from './App'
import { BibleApp } from './BibleApp'
import { Landing } from './Landing'
import { Splash } from './Splash'

const SEEN_LANDING_KEY = 'seen-landing'
const SEEN_SPLASH_KEY = 'seen-splash'

function isStandalonePwa(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches
}

/** Телефон/тесен екран — самото приложение вече е мобилен дизайн, затова
 *  landing-а (маркетинг страница) е излишен и само дублира началния екран. */
function isMobile(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches
}

/** Споделен линк за стих (/?stih=…) — отваря направо „Тих Стих". */
function hasSharedPoemLink(): boolean {
  return typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('stih')
}

/** Splash се показва веднъж на сесия при вход в „Попитай Библията". */
function initialShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  if (hasSharedPoemLink()) return false // „Тих Стих" не ползва този splash
  try {
    if (sessionStorage.getItem(SEEN_SPLASH_KEY) === '1') return false
  } catch {
    /* ignore */
  }
  return true
}

function initialShowLanding(): boolean {
  if (typeof window === 'undefined') return false
  if (hasSharedPoemLink()) return false
  if (isStandalonePwa()) return false
  if (isMobile()) return false
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
  const [showSplash, setShowSplash] = useState(initialShowSplash)

  function enterApp() {
    try {
      localStorage.setItem(SEEN_LANDING_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowLanding(false)
  }

  function dismissSplash() {
    try {
      sessionStorage.setItem(SEEN_SPLASH_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowSplash(false)
  }

  if (showLanding) {
    return <Landing onEnterApp={enterApp} />
  }

  if (hasSharedPoemLink()) {
    return <PoetryApp />
  }

  // Приложението се монтира под splash-а, за да е готово при избледняването.
  return (
    <>
      <BibleApp />
      {showSplash && <Splash onDone={dismissSplash} />}
    </>
  )
}
