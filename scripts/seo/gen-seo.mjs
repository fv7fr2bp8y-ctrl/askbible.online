// SEO: статични страници по теми (/temas/<slug>/), списък на темите (/temas/) и sitemap.xml.
// Пуска се след `vite build` и пише направо в dist/. Текстът на стиховете идва от
// public/bible (Reina-Valera 1909, обществено достояние). Без външни API.
//
// Стартирай:  node scripts/seo/gen-seo.mjs   (след vite build)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { topics } from './topics.mjs'

const SITE = 'https://askbible.online'
const APP_NAME = 'Pregúntale a la Biblia'
const PLAY_URL = 'https://play.google.com/store/apps/details?id=online.askbible.twa'
const BIBLE_DIR = new URL('../../public/bible/', import.meta.url)
const DIST = new URL('../../dist/', import.meta.url)
const TODAY = new Date().toISOString().slice(0, 10)

if (!existsSync(DIST)) {
  console.error('Няма dist/. Първо пусни vite build.')
  process.exit(1)
}

// ---------- Стихове ----------
const books = {}
const book = (code) => (books[code] ??= JSON.parse(readFileSync(new URL(`${code}.json`, BIBLE_DIR), 'utf8')))

const CAPS = /[A-ZÁÉÍÓÚÑÜ]{2,}/

// Първият стих на глава в RV1909 започва с дума с главни букви („JEHOVÁ es mi pastor“),
// а в Псалмите пред нея стои надписът („Salmo de David.“). Изчистваме и двете.
function tidyFirstVerse(code, chapter, text) {
  if (code === 'Ps' && chapter === '119') text = text.replace(/^[A-ZÁÉÍÓÚÑ]+\.\s+/, '')
  const m = text.match(CAPS)
  if (!m) return text
  let before = text.slice(0, m.index)
  const word = m[0]
  if (code === 'Ps' && before.trim()) before = '' // надпис на псалма
  const fixed = before.trim() ? word.toLowerCase() : word[0] + word.slice(1).toLowerCase()
  return before + fixed + text.slice(m.index + word.length)
}

function resolve(ref) {
  const m = ref.match(/^(\w+) (\d+):(\d+)(?:-(\d+))?$/)
  if (!m) throw new Error(`Лоша референция: ${ref}`)
  const [, code, ch, v1, v2] = m
  const b = book(code)
  const parts = []
  for (let v = +v1; v <= (+v2 || +v1); v++) {
    let t = b.chapters[ch]?.[v]?.[0]
    if (!t) throw new Error(`Липсва стих: ${ref} (${v})`)
    if (v === 1) t = tidyFirstVerse(code, ch, t)
    parts.push(t)
  }
  return { ref: `${b.es} ${ch}:${v1}${v2 ? '-' + v2 : ''}`, text: parts.join(' ') }
}

// ---------- HTML помощници ----------
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`
const appLink = (q) => `/?q=${encodeURIComponent(q)}`

const CSS = `
:root{--bg:#14100c;--bg2:#1d1610;--ink:#f3e9d7;--muted:#c9b99c;--gold:#e8c98a;--line:rgba(232,201,138,.22)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:radial-gradient(130% 50% at 50% 0,#221910 0,#14100c 60%,#0d0a06 100%) fixed;background-color:var(--bg);color:var(--ink);font:17px/1.6 'Geist',system-ui,-apple-system,'Segoe UI',sans-serif}
a{color:var(--gold)}
.wrap{max-width:720px;margin:0 auto;padding:0 18px}
header{display:flex;align-items:center;gap:10px;padding:18px 0}
header a{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font:600 20px/1.2 'Cormorant',Georgia,serif}
header img{width:36px;height:36px}
nav.crumbs{font-size:14px;color:var(--muted);margin:6px 0 4px}nav.crumbs a{text-decoration:none}
h1{font:700 clamp(32px,7vw,46px)/1.1 'Cormorant',Georgia,serif;color:var(--gold);margin:10px 0 14px}
h2{font:600 26px/1.2 'Cormorant',Georgia,serif;color:var(--gold);margin:36px 0 12px}
.intro{color:var(--muted);font-size:18px}
.cta{margin:22px 0;padding:18px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03)}
.cta p{margin:0 0 12px;color:var(--muted);font-size:15px}
.btns{display:flex;flex-wrap:wrap;gap:10px}
.btn{display:inline-block;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:15px}
.btn.main{background:linear-gradient(180deg,#f0d49a,#d7b06c);color:#1a120a}
.btn.alt{border:1px solid var(--line);color:var(--gold)}
ol.verses{list-style:none;padding:0;margin:0}
ol.verses li{padding:18px 0;border-bottom:1px solid var(--line)}
blockquote{margin:0;font:500 22px/1.45 'Cormorant Garamond',Georgia,serif;color:var(--ink)}
cite{display:block;margin-top:6px;font-style:normal;font-size:14px;letter-spacing:.04em;color:var(--gold)}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0;margin:0;list-style:none}
.chips a{display:inline-block;padding:8px 14px;border:1px solid var(--line);border-radius:999px;text-decoration:none;font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;padding:0;list-style:none}
.grid a{display:block;padding:14px 16px;border:1px solid var(--line);border-radius:14px;text-decoration:none;color:var(--ink)}
.grid a span{display:block;color:var(--muted);font-size:13px;margin-top:2px}
footer{margin:48px 0 28px;padding-top:18px;border-top:1px solid var(--line);color:var(--muted);font-size:14px}
footer a{margin-right:14px}
`

function page({ path, title, description, body, jsonld }) {
  const url = SITE + path
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${url}" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="theme-color" content="#14100c" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="${APP_NAME}" />
<meta property="og:locale" content="es_ES" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${SITE}/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="${SITE}/og-image.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@600;700&family=Cormorant+Garamond:wght@500&family=Geist:wght@400;600&display=swap" rel="stylesheet" />
<style>${CSS}</style>
${jsonld.map(ld).join('\n')}
</head>
<body>
<div class="wrap">
<header><a href="/"><img src="/logo-emblem.png" alt="" width="36" height="36" />${APP_NAME}</a></header>
${body}
<footer>
<p>Texto bíblico: Reina-Valera 1909 (dominio público).</p>
<p><a href="/">Hacer una pregunta</a><a href="/temas/">Todos los temas</a><a href="${PLAY_URL}" rel="noopener">Google Play</a><a href="/privacy.html">Privacidad</a></p>
</footer>
</div>
</body>
</html>
`
}

const crumbsLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })),
})

const short = (t) => t.h1.replace(/^Versículos (sobre |de |para )?(la |el |los |un )?/i, '').replace(/^Qué dice la Biblia sobre (el |la )?/i, '')
const label = (t) => short(t).charAt(0).toUpperCase() + short(t).slice(1)
const bySlug = Object.fromEntries(topics.map((t) => [t.slug, t]))

// ---------- Страници по теми ----------
for (const t of topics) {
  const verses = t.refs.map(resolve)
  const path = `/temas/${t.slug}/`
  const title = `${t.h1} | ${verses.length} versículos (Reina-Valera 1909)`
  const description = `${verses.length} versículos de la Biblia sobre ${t.phrase} con el texto completo de la Reina-Valera 1909: ${verses
    .slice(0, 3)
    .map((v) => v.ref)
    .join(', ')} y más. Haz tu propia pregunta a la Biblia.`
  const body = `
<nav class="crumbs" aria-label="Ruta"><a href="/">Inicio</a> › <a href="/temas/">Temas</a> › ${esc(label(t))}</nav>
<main>
<h1>${esc(t.h1)}</h1>
<p class="intro">${esc(t.intro)}</p>
<div class="cta">
<p>¿Tienes una pregunta propia? Escríbela y recibe el versículo que le habla, con una breve reflexión.</p>
<div class="btns"><a class="btn main" href="${esc(appLink(t.question))}">Pregúntale a la Biblia</a><a class="btn alt" href="${PLAY_URL}" rel="noopener">Descargar en Google Play</a></div>
</div>
<h2>${verses.length} versículos sobre ${esc(t.phrase)}</h2>
<ol class="verses">
${verses.map((v) => `<li><blockquote>${esc(v.text)}</blockquote><cite>${esc(v.ref)}</cite></li>`).join('\n')}
</ol>
<h2>Temas relacionados</h2>
<ul class="chips">${t.rel.map((s) => `<li><a href="/temas/${s}/">${esc(bySlug[s].h1)}</a></li>`).join('')}</ul>
</main>`
  const jsonld = [
    crumbsLd([
      ['Inicio', '/'],
      ['Temas', '/temas/'],
      [label(t), path],
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t.h1,
      description,
      url: SITE + path,
      inLanguage: 'es',
      isPartOf: { '@type': 'WebSite', name: APP_NAME, url: SITE + '/' },
      dateModified: TODAY,
    },
  ]
  mkdirSync(new URL(`temas/${t.slug}/`, DIST), { recursive: true })
  writeFileSync(new URL(`temas/${t.slug}/index.html`, DIST), page({ path, title, description, body, jsonld }))
}

// ---------- /temas/ ----------
{
  const path = '/temas/'
  const title = 'Versículos de la Biblia por tema | Pregúntale a la Biblia'
  const description = `Versículos bíblicos por tema en la Reina-Valera 1909: ansiedad, miedo, paz, perdón, amor, fe, esperanza y ${topics.length - 7} temas más.`
  const body = `
<nav class="crumbs" aria-label="Ruta"><a href="/">Inicio</a> › Temas</nav>
<main>
<h1>Versículos de la Biblia por tema</h1>
<p class="intro">Elige un tema y lee versículos escogidos de la Reina-Valera 1909. Si no encuentras el tuyo, hazle tu pregunta a la Biblia y recibe el versículo que le habla.</p>
<div class="cta"><div class="btns"><a class="btn main" href="/">Hacer una pregunta</a><a class="btn alt" href="${PLAY_URL}" rel="noopener">Descargar en Google Play</a></div></div>
<ul class="grid">
${topics.map((t) => `<li><a href="/temas/${t.slug}/">${esc(t.h1)}<span>${t.refs.length} versículos</span></a></li>`).join('\n')}
</ul>
</main>`
  const jsonld = [
    crumbsLd([
      ['Inicio', '/'],
      ['Temas', path],
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Versículos de la Biblia por tema',
      url: SITE + path,
      inLanguage: 'es',
      hasPart: topics.map((t) => ({ '@type': 'WebPage', name: t.h1, url: `${SITE}/temas/${t.slug}/` })),
    },
  ]
  mkdirSync(new URL('temas/', DIST), { recursive: true })
  writeFileSync(new URL('temas/index.html', DIST), page({ path, title, description, body, jsonld }))
}

// ---------- sitemap.xml ----------
{
  const urls = [
    ['/', '1.0'],
    ['/temas/', '0.8'],
    ...topics.map((t) => [`/temas/${t.slug}/`, '0.7']),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${TODAY}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`
  writeFileSync(new URL('sitemap.xml', DIST), xml)
}

console.log(`SEO: ${topics.length} теми + /temas/ + sitemap.xml (${topics.length + 2} адреса)`)
