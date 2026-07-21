import { useI18n } from './lib/i18n'
import { assetUrl } from './lib/asset'
import { IconBook, IconHarp, IconScroll, IconFlame, IconDove, IconStar } from './lib/icons'
import './landing.css'

/** Малки inline SVG икони — точно според дизайна (stroke наследява цвета). */
function IconAsk() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4L3 21l1.1-3.3A8.4 8.4 0 1 1 21 11.5z" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.7-.9 1.4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
function IconSpark() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7z" />
      <path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </svg>
  )
}
function IconPlay() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#d7b06c">
      <path d="M3 3l16 9-16 9z" opacity="0.9" />
    </svg>
  )
}

interface Step {
  num: string
  title: string
  body: string
  icon: () => JSX.Element
}
interface Cat {
  id: string
  name: string
  desc: string
  icon: () => JSX.Element
}

const COPY = {
  bg: {
    brand: 'ПОПИТАЙ БИБЛИЯТА',
    navHow: 'Как работи',
    navCats: 'Категории',
    navCta: 'Свали',
    heroEyebrow: 'ЗАДАЙ СВОЯ ВЪПРОС',
    heroTitle1: 'ПОПИТАЙ',
    heroTitle2: 'БИБЛИЯТА!',
    heroTagline: 'Тя има отговор за всичко.',
    heroCta: 'Задай въпрос',
    heroCta2: 'Разгледай категориите',
    heroReassure: 'Безплатно · Отговор за секунди · На български и английски',
    howEyebrow: 'КАК РАБОТИ',
    howTitle: 'Три стъпки до отговора',
    steps: [
      { num: '01', title: 'Попитай', body: 'Напиши какво те вълнува — със свои думи, точно както би попитал приятел.', icon: IconAsk },
      { num: '02', title: 'Получи стих', body: 'Приложението намира най-подходящия библейски стих за твоя въпрос.', icon: IconBook },
      { num: '03', title: 'Размисли', body: 'Кратко тълкувание ти помага да приложиш словото в своя ден.', icon: IconSpark },
    ] as Step[],
    verseText: 'Мир ви оставям; Моя мир ви давам: Аз ви давам не тъй, както светът дава.',
    verseRef: 'Йоан 14:27',
    catsEyebrow: 'РАЗГЛЕДАЙ',
    catsTitle: 'Открий по теми',
    categories: [
      { id: 'gospels', name: 'Евангелия', desc: 'Животът и словата на Христос', icon: IconBook },
      { id: 'psalms', name: 'Псалми', desc: 'Молитви, хваление и утеха', icon: IconHarp },
      { id: 'proverbs', name: 'Притчи', desc: 'Мъдрост за всекидневието', icon: IconScroll },
      { id: 'ot', name: 'Пророци', desc: 'Обещания и надежда', icon: IconFlame },
      { id: 'nt', name: 'Послания', desc: 'Напътствия за живата вяра', icon: IconDove },
    ] as Cat[],
    ctaTitle: 'Задай своя въпрос.',
    ctaSub: 'Библията има отговор за всичко — открий своя днес.',
    storeSmall: 'Свали от',
    footer: '© 2026 Попитай Библията · Всички права запазени',
  },
  en: {
    brand: 'ASK THE BIBLE',
    navHow: 'How it works',
    navCats: 'Categories',
    navCta: 'Download',
    heroEyebrow: 'ASK YOUR QUESTION',
    heroTitle1: 'ASK',
    heroTitle2: 'THE BIBLE!',
    heroTagline: 'It has an answer for everything.',
    heroCta: 'Ask a question',
    heroCta2: 'Browse categories',
    heroReassure: 'Free · Answers in seconds · Bulgarian & English',
    howEyebrow: 'HOW IT WORKS',
    howTitle: 'Three steps to your answer',
    steps: [
      { num: '01', title: 'Ask', body: 'Write what is on your heart — in your own words, just as you would ask a friend.', icon: IconAsk },
      { num: '02', title: 'Get a verse', body: 'The app finds the Bible verse that speaks most closely to your question.', icon: IconBook },
      { num: '03', title: 'Reflect', body: 'A short reflection helps you carry the word into your day.', icon: IconSpark },
    ] as Step[],
    verseText: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives.',
    verseRef: 'John 14:27',
    catsEyebrow: 'EXPLORE',
    catsTitle: 'Discover by theme',
    categories: [
      { id: 'gospels', name: 'Gospels', desc: 'The life and words of Christ', icon: IconBook },
      { id: 'psalms', name: 'Psalms', desc: 'Prayers, praise and comfort', icon: IconHarp },
      { id: 'proverbs', name: 'Proverbs', desc: 'Wisdom for everyday life', icon: IconScroll },
      { id: 'ot', name: 'Prophets', desc: 'Promises and hope', icon: IconFlame },
      { id: 'nt', name: 'Epistles', desc: 'Guidance for living faith', icon: IconDove },
    ] as Cat[],
    ctaTitle: 'Ask your question.',
    ctaSub: 'The Bible has an answer for everything — find yours today.',
    storeSmall: 'Get it on',
    footer: '© 2026 Ask the Bible · All rights reserved',
  },
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Входна (маркетингова) страница — показва се преди самото приложение. */
export function Landing({ onEnterApp }: { onEnterApp: () => void }) {
  const { lang, toggle } = useI18n()
  const t = COPY[lang]
  const emblem = assetUrl('/logo-emblem.png')

  return (
    <div className="landing">
      <nav className="lp-nav">
        <div className="lp-brand-row">
          <img className="lp-emblem-nav" src={emblem} alt="" />
          <span className="lp-brand">{t.brand}</span>
        </div>
        <div className="lp-nav-right">
          <button className="lp-nav-link" onClick={() => scrollToId('lp-how')}>{t.navHow}</button>
          <button className="lp-nav-link" onClick={() => scrollToId('lp-categories')}>{t.navCats}</button>
          <div className="lp-lang">
            <button className={`lp-lang-btn${lang === 'bg' ? ' is-on' : ''}`} onClick={() => lang !== 'bg' && toggle()}>BG</button>
            <button className={`lp-lang-btn${lang === 'en' ? ' is-on' : ''}`} onClick={() => lang !== 'en' && toggle()}>EN</button>
          </div>
          <button className="lp-cta-btn" onClick={onEnterApp}>{t.navCta}</button>
        </div>
      </nav>

      <section className="lp-hero">
        <div className="lp-hero-beam" aria-hidden />
        <div className="lp-hero-glow" aria-hidden />
        <img className="lp-emblem-hero" src={emblem} alt="" />
        <div className="lp-eyebrow">{t.heroEyebrow}</div>
        <h1 className="lp-hero-title">
          {t.heroTitle1}
          <br />
          {t.heroTitle2}
        </h1>
        <div className="lp-divider">
          <span className="lp-divider-line" />
          <span className="lp-divider-mark">◆</span>
          <span className="lp-divider-line is-right" />
        </div>
        <p className="lp-tagline">{t.heroTagline}</p>
        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={onEnterApp}>{t.heroCta}</button>
          <button className="lp-btn-secondary" onClick={() => scrollToId('lp-categories')}>{t.heroCta2}</button>
        </div>
        <div className="lp-reassure">{t.heroReassure}</div>
      </section>

      <section id="lp-how" className="lp-how">
        <div className="lp-section-head">
          <div className="lp-section-eyebrow">{t.howEyebrow}</div>
          <h2 className="lp-section-title">{t.howTitle}</h2>
        </div>
        <div className="lp-steps">
          {t.steps.map((s) => (
            <div className="lp-step" key={s.num}>
              <div className="lp-step-icon"><s.icon /></div>
              <div className="lp-step-num">{s.num}</div>
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-verse">
        <div className="lp-verse-beam" aria-hidden />
        <div className="lp-verse-inner">
          <IconStar />
          <p className="lp-verse-text">„{t.verseText}“</p>
          <div className="lp-verse-ref">— {t.verseRef}</div>
        </div>
      </section>

      <section id="lp-categories" className="lp-cats">
        <div className="lp-section-head">
          <div className="lp-section-eyebrow">{t.catsEyebrow}</div>
          <h2 className="lp-section-title">{t.catsTitle}</h2>
        </div>
        <div className="lp-cats-grid">
          {t.categories.map((c) => (
            <button className="lp-cat-card" key={c.id} onClick={onEnterApp}>
              <div className="lp-cat-icon"><c.icon /></div>
              <div>
                <div className="lp-cat-name">{c.name}</div>
                <div className="lp-cat-desc">{c.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="lp-final">
        <div className="lp-final-glow" aria-hidden />
        <h2 className="lp-final-title">{t.ctaTitle}</h2>
        <p className="lp-final-sub">{t.ctaSub}</p>
        <div className="lp-final-actions">
          <button className="lp-store-btn" onClick={onEnterApp}>
            <IconPlay />
            <div>
              <div className="lp-store-small">{t.storeSmall}</div>
              <div className="lp-store-big">Google Play</div>
            </div>
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <img className="lp-emblem-footer" src={emblem} alt="" />
          <span className="lp-footer-name">{t.brand}</span>
        </div>
        <div className="lp-footer-copy">{t.footer}</div>
      </footer>
    </div>
  )
}
