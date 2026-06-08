import { useEffect, useState } from 'react'
import { PoetryApp } from './App'
import { BibleApp } from './BibleApp'

type Mode = 'bible' | 'poetry'
const MODE_KEY = 'app-mode'

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
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  return mode === 'bible' ? (
    <BibleApp onToPoetry={() => setMode('poetry')} />
  ) : (
    <PoetryApp onToBible={() => setMode('bible')} />
  )
}
