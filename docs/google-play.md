# Публикуване в Google Play

Приложението е PWA. За Play Store го опаковаме като **TWA** (Trusted Web
Activity) — тънка Android обвивка около сайта `https://askbible.online`.

## Какво вече е готово в репото
- ✅ Manifest с правилни икони (192 / 512 / maskable), категории, ориентация
- ✅ `public/.well-known/assetlinks.json` (шаблон — чака отпечатъка)
- ✅ `public/privacy.html` → публична Privacy Policy на `https://askbible.online/privacy.html`
  - ⚠️ Смени `ЗАМЕНИ@ТВОЯ-ИМЕЙЛ` с реален контакт преди подаване.

## Стъпки

### 1. Генерирай Android пакета (PWABuilder — най-лесно)
1. Отвори **https://www.pwabuilder.com** → въведи `https://askbible.online`
2. Избери **Android → Google Play** (пакетът е TWA, формат **.aab**)
3. Package ID: **`online.askbible.twa`** (трябва да съвпада с assetlinks.json)
4. Свали `.aab` файла и `assetlinks.json`, който PWABuilder предлага.

### 2. Google Play Console
1. Регистрирай се: **https://play.google.com/console** (еднократно $25)
2. Create app → име „Попитай Библията", език по подразбиране български, безплатно
3. Качи `.aab` в **Testing → Internal testing** (първо вътрешно, после Production)

### 3. Свържи домейна (маха адресната лента)
1. В Play Console → **App signing** → копирай **SHA-256 certificate fingerprint**
2. Сложи го в `public/.well-known/assetlinks.json` на мястото на
   `ЗАМЕНИ_С_SHA256_ОТ_PLAY_CONSOLE_APP_SIGNING`
3. Commit + push → изчакай деплоя. Провери:
   `https://askbible.online/.well-known/assetlinks.json`

### 4. Store listing (попълва се в Play Console)
- **Икона:** `public/logo-emblem.png` (512×512) ✅
- **Feature graphic:** 1024×500 (имаш визуалите от дизайна — ползвай един от тях)
- **Screenshots:** поне 2 от телефон (snimki от самото приложение)
- **Privacy policy URL:** `https://askbible.online/privacy.html`
- **Data safety:** „Данни, споделяни с трети страни" → текстът на въпроса отива
  към Google (обработка, не съхранение); нищо друго не се събира.
- **Content rating:** попълни въпросника → резултат „Everyone / За всички"

---

## Текст за описанието

### Български
**Заглавие (до 30 знака):** `Попитай Библията`

**Кратко описание (до 80 знака):**
`Задай въпрос и получи най-подходящия библейски стих с кратък размисъл.`

**Пълно описание:**
```
Попитай Библията с думите, които носиш в сърцето си — а приложението намира
най-подходящия стих за твоя въпрос.

Не търси буквално съвпадение на думи, а долавя по-дълбоката нужда зад въпроса:
спокойствие, кураж, утеха, надежда, прошка или благодарност. Всеки отговор идва
с кратък топъл размисъл как да приложиш словото в своя ден.

• Търсене в цялата Библия (66 книги)
• Реален, проверен текст — никога измислени цитати
• Кратък размисъл към всеки стих
• Разглеждане по теми: Евангелия, Псалми, Притчи, Пророци, Послания
• Запазвай любими стихове
• На български и английски
• Безплатно, без реклами, без регистрация

Задай своя въпрос — Библията има отговор.
```

### English
**Title (≤30):** `Ask the Bible`

**Short description (≤80):**
`Ask a question and receive the Bible verse that speaks to it, with a reflection.`

**Full description:**
```
Ask the Bible in your own words — and the app finds the verse that speaks most
closely to your question.

Instead of matching words literally, it senses the deeper need behind the
question: peace, courage, comfort, hope, forgiveness or gratitude. Every answer
comes with a short, warm reflection on how to carry it into your day.

• Searches the whole Bible (66 books)
• Real, verified text — never fabricated quotes
• A short reflection with every verse
• Browse by theme: Gospels, Psalms, Proverbs, Prophets, Epistles
• Save your favorite verses
• In Bulgarian and English
• Free, no ads, no sign-up

Ask your question — the Bible has an answer.
```
