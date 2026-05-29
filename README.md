# Тих Стих

Уеб приложение (PWA) за записани стихове — слушане, четене и споделяне.
Домейн: **tihstih.eu**

Изградено с [Vite](https://vite.dev) + React + TypeScript. Работи в браузър,
инсталира се на телефон като приложение и е готово за по-късно опаковане в
native мобилен апп (App Store / Google Play) върху същата кодова база.

## Функции

- 🎧 **Слушане** — аудио плейър със закотвена долна лента, превъртане и
  контроли на заключен екран (Media Session).
- 📚 **Албуми/категории** — стиховете са групирани по албуми.
- 📖 **Текст** — текстът на стиха се показва под плейъра.
- ↗ **Споделяне** — native споделяне на телефон, копиране на линк на десктоп.
  Споделените линкове (`/?stih=<id>`) пускат стиха директно.
- 📴 **Офлайн** — аудиото се кешира след първото пускане (PWA).

## Стартиране

```bash
npm install
npm run dev        # за разработка → http://localhost:5173
npm run build      # production build в dist/
npm run preview    # преглед на build-а
```

## Как се добавя нов стих

1. Сложи аудио файла в `public/audio/` (напр. `public/audio/dom.mp3`).
2. Сложи обложката в `public/covers/` (напр. `public/covers/dom.jpg`).
3. Добави запис в `src/data/poems.ts`:

```ts
{
  id: 'dom',                 // уникален, ползва се и в линка за споделяне
  title: 'Дом',
  author: 'Иван Иванов',
  audio: '/audio/dom.mp3',   // път от public/, започва с /
  cover: '/covers/dom.jpg',
  text: 'Първи ред…\nВтори ред…',
}
```

Виж и `public/audio/README.md` и `public/covers/README.md` за препоръки.

## Структура

```
public/
  audio/      ← аудио записите
  covers/     ← обложките
src/
  data/poems.ts        ← СЪДЪРЖАНИЕТО (албуми и стихове) — редактирай тук
  types.ts             ← типове Album / Poem
  hooks/useAudioPlayer.ts
  components/           ← Player, ShareButton
  App.tsx              ← основен изглед
```

## Следващи стъпки (по желание)

- PNG икони `192×192` и `512×512` за по-добра инсталация на iOS/Android.
- Опаковане в мобилен апп с [Capacitor](https://capacitorjs.com).
- Деплой на tihstih.eu (статичен хостинг: Netlify, Vercel, Cloudflare Pages).
