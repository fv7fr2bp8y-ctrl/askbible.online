export interface Poem {
  /** Уникален идентификатор, използва се и в URL за споделяне. */
  id: string
  /** Заглавие на стиха. */
  title: string
  /** Автор на стиха (по желание). */
  author?: string
  /** Път до аудио файла, спрямо public/, напр. "/audio/moiat-stih.mp3". */
  audio: string
  /** Английско аудио (по желание) — ползва се в EN режим, ако е налично. */
  audioEn?: string
  /** Път до обложката, спрямо public/, напр. "/covers/moiat-stih.jpg". */
  cover?: string
  /** Текстът на стиха (по желание) — показва се под плейъра. */
  text?: string
  /** Продължителност в секунди (по желание, само за показване). */
  duration?: number
  /** Етикети/настроения (по желание), напр. ["Искрено", "Дълбоко"]. */
  tags?: string[]
}

export interface Album {
  /** Уникален идентификатор на албума/категорията. */
  id: string
  /** Заглавие на албума/категорията. */
  title: string
  /** Кратко описание (по желание). */
  description?: string
  /** Обложка на албума (по желание). */
  cover?: string
  /** Стиховете в този албум. */
  poems: Poem[]
}

/** Категория на библейски откъс. */
export type PassageCategory = 'gospels' | 'psalms' | 'proverbs' | 'nt' | 'ot'

/** Подбран „завършен" откъс от Писанието, двуезичен. */
export interface Passage {
  id: string
  category: PassageCategory
  /** Препратка на български, напр. „Матей 6:34". */
  refBg: string
  /** Препратка на английски, напр. „Matthew 6:34". */
  refEn: string
  /** OSIS код на книгата (за зареждане на контекста). */
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
  /** Текст на български. */
  bg: string
  /** Текст на английски. */
  en: string
  /** Кратък размисъл (само при отговор на въпрос — от Gemini). */
  reflection?: { bg: string; en: string }
  /** true само когато отговорът идва от офлайн резерва (Gemini недостъпен). */
  offline?: boolean
}
