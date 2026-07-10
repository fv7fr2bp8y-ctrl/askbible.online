import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'bg' | 'en'

export interface Strings {
  tagline: string
  searchPlaceholder: string
  searchAria: string
  categories: string
  all: string
  poemOfDay: string
  share: string
  copied: string
  shareAria: string
  empty: string
  pause: string
  play: (title: string) => string
  pauseTitle: (title: string) => string
  seek: string
  short: string
  medium: string
  long: string
  langName: string
  bible: {
    title: string
    tagline: string
    openedHere: string
    readContext: string
    save: string
    saved: string
    unsave: string
    listen: string
    stop: string
    openAgain: string
    surprise: string
    toPoetry: string
    toBible: string
    close: string
    savedTitle: string
    noSaved: string
    voice: string
    male: string
    female: string
    cats: { gospels: string; psalms: string; proverbs: string; nt: string; ot: string }
    askPlaceholder: string
    askButton: string
    asking: string
    answerIntro: string
    askAria: string
  }
}

const STRINGS: Record<Lang, Strings> = {
  bg: {
    tagline: 'Дневна доза поезия срещу шума на света',
    searchPlaceholder: 'Какво искаш да чуеш днес?',
    searchAria: 'Търсене',
    categories: 'Категории',
    all: 'Всички',
    poemOfDay: 'Стих на деня',
    share: '↗ Сподели',
    copied: '✓ Копирано',
    shareAria: 'Сподели стиха',
    empty: 'Няма намерени стихове.',
    pause: 'Пауза',
    play: (t) => `Пусни „${t}“`,
    pauseTitle: (t) => `Пауза — „${t}“`,
    seek: 'Превъртане',
    short: 'Кратко',
    medium: 'Средно',
    long: 'Дълго',
    langName: 'EN',
    bible: {
      title: 'Писание',
      tagline: 'Кратък откъс от Писанието за въпроса, който носиш в себе си.',
      openedHere: 'Писанието се отвори тук:',
      readContext: 'Прочети контекста',
      save: 'Запази',
      saved: 'Запазено',
      unsave: 'Премахни',
      listen: 'Чуй',
      stop: 'Спри',
      openAgain: 'Отвори отново',
      surprise: 'Изненадай ме',
      toPoetry: 'Тих Стих',
      toBible: 'Писание',
      close: 'Затвори',
      savedTitle: 'Запазени',
      noSaved: 'Още нямаш запазени откъси.',
      voice: 'Глас',
      male: 'мъжки',
      female: 'женски',
      cats: { gospels: 'Евангелия', psalms: 'Псалми', proverbs: 'Притчи', nt: 'Нов Завет', ot: 'Стар Завет' },
      askPlaceholder: 'Какъв е въпросът, който носиш в себе си?',
      askButton: 'Намери отговор',
      asking: 'Търся…',
      answerIntro: 'Писанието ти отговаря тук:',
      askAria: 'Задай въпрос',
    },
  },
  en: {
    tagline: 'A daily dose of poetry against the noise of the world',
    searchPlaceholder: 'What would you like to hear today?',
    searchAria: 'Search',
    categories: 'Categories',
    all: 'All',
    poemOfDay: 'Poem of the Day',
    share: '↗ Share',
    copied: '✓ Copied',
    shareAria: 'Share this poem',
    empty: 'No poems found.',
    pause: 'Pause',
    play: (t) => `Play “${t}”`,
    pauseTitle: (t) => `Pause — “${t}”`,
    seek: 'Seek',
    short: 'Short',
    medium: 'Medium',
    long: 'Long',
    langName: 'БГ',
    bible: {
      title: 'Scripture',
      tagline: 'A short passage from the Bible for the question you carry.',
      openedHere: 'The Scripture opened here:',
      readContext: 'Read the context',
      save: 'Save',
      saved: 'Saved',
      unsave: 'Remove',
      listen: 'Listen',
      stop: 'Stop',
      openAgain: 'Open again',
      surprise: 'Surprise me',
      toPoetry: 'Tih Stih',
      toBible: 'Scripture',
      close: 'Close',
      savedTitle: 'Saved',
      noSaved: 'You have no saved passages yet.',
      voice: 'Voice',
      male: 'male',
      female: 'female',
      cats: { gospels: 'Gospels', psalms: 'Psalms', proverbs: 'Proverbs', nt: 'New Testament', ot: 'Old Testament' },
      askPlaceholder: 'What is the question you carry?',
      askButton: 'Find an answer',
      asking: 'Searching…',
      answerIntro: 'Scripture answers you here:',
      askAria: 'Ask a question',
    },
  },
}

/** Английски имена на албумите/поетите по id (id-тата са стабилни). */
const ALBUM_EN: Record<string, string> = {
  izbrano: 'Featured',
  vazov: 'Ivan Vazov',
  yavorov: 'Peyo Yavorov',
  smirnenski: 'Hristo Smirnenski',
  vaptsarov: 'Nikola Vaptsarov',
  bashev: 'Vladimir Bashev',
  damyanov: 'Damyan Damyanov',
  germanov: 'Andrey Germanov',
}

/** Транслитерация на авторите (кирилица → латиница). */
const AUTHOR_EN: Record<string, string> = {
  'Иван Вазов': 'Ivan Vazov',
  'Пейо Яворов': 'Peyo Yavorov',
  'Христо Смирненски': 'Hristo Smirnenski',
  'Никола Вапцаров': 'Nikola Vaptsarov',
  'Владимир Башев': 'Vladimir Bashev',
  'Дамян Дамянов': 'Damyan Damyanov',
  'Андрей Германов': 'Andrey Germanov',
}

export interface I18n {
  lang: Lang
  toggle: () => void
  t: Strings
  /** Заглавие на албум за текущия език (с резерв оригинала от данните). */
  albumTitle: (id: string, fallback: string) => string
  /** Име на автор за текущия език. */
  authorName: (name?: string) => string | undefined
}

const Ctx = createContext<I18n | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'bg' || saved === 'en') return saved
  } catch {
    /* ignore */
  }
  // Авто по езика на браузъра: български → BG, иначе EN.
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('bg')
    ? 'bg'
    : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
  }, [lang])

  const value: I18n = {
    lang,
    toggle: () => setLang((l) => (l === 'bg' ? 'en' : 'bg')),
    t: STRINGS[lang],
    albumTitle: (id, fallback) => (lang === 'en' ? ALBUM_EN[id] ?? fallback : fallback),
    authorName: (name) =>
      name === undefined ? undefined : lang === 'en' ? AUTHOR_EN[name] ?? name : name,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
