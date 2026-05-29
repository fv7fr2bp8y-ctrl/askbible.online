/**
 * Детерминиран цвят и инициали по име на поет/категория — за корици-заместители
 * и акценти, когато няма истинско изображение.
 */
export interface PoetTheme {
  c1: string
  c2: string
}

export function poetTheme(key: string): PoetTheme {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 360
  // Топли, приглушени тонове в духа на палитрата.
  return {
    c1: `hsl(${h} 38% 60%)`,
    c2: `hsl(${(h + 28) % 360} 34% 46%)`,
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0] ?? '').join('').toUpperCase()
}
