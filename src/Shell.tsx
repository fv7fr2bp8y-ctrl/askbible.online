import { useState } from 'react'
import { PoetryApp } from './App'
import { BibleApp } from './BibleApp'
import { Splash } from './Splash'

const SEEN_SPLASH_KEY = 'seen-splash'

/** Споделен линк за стих (/?stih=…) — отваря „Тих Стих" (българска поезия). */
function hasSharedPoemLink(): boolean {
  return typeof window !== 'undefined' && !!new URLSearchParams(window.location.search).get('stih')
}

/** Splash се показва веднъж на сесия при вход. */
function initialShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  if (hasSharedPoemLink()) return false
  try {
    if (sessionStorage.getItem(SEEN_SPLASH_KEY) === '1') return false
  } catch {
    /* ignore */
  }
  return true
}

// „Pregúntale a la Biblia" е основното (испанско) приложение. „Тих Стих" е
// отделен продукт, достъпен само през пряк споделен линк за стих.
export default function Shell() {
  const [showSplash, setShowSplash] = useState(initialShowSplash)

  function dismissSplash() {
    try {
      sessionStorage.setItem(SEEN_SPLASH_KEY, '1')
    } catch {
      /* ignore */
    }
    setShowSplash(false)
  }

  if (hasSharedPoemLink()) {
    return <PoetryApp />
  }

  return (
    <>
      <BibleApp />
      {showSplash && <Splash onDone={dismissSplash} />}
    </>
  )
}
