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

## Текст за описанието (испански — за първото пускане)

**Заглавие (до 30 знака):** `Pregúntale a la Biblia`

**Кратко описание (до 80 знака):**
`Haz una pregunta y recibe el versículo bíblico que le habla, con una reflexión.`

**Пълно описание:**
```
Pregúntale a la Biblia con las palabras que llevas en el corazón — y la app
encuentra el versículo que mejor habla a tu pregunta.

En lugar de buscar coincidencias literales de palabras, percibe la necesidad más
profunda detrás de la pregunta: paz, valor, consuelo, esperanza, perdón o
gratitud. Cada respuesta llega con una breve y cálida reflexión para llevar la
Palabra a tu día.

• Busca en toda la Biblia (66 libros)
• Texto real y verificado (Reina-Valera 1909) — nunca citas inventadas
• Una breve reflexión con cada versículo
• Explora por temas: Evangelios, Salmos, Proverbios, Profetas, Epístolas
• Guarda tus versículos favoritos
• Gratis, sin anuncios, sin registro

Haz tu pregunta — la Biblia tiene una respuesta.
```

> Privacy Policy: `https://askbible.online/privacy.html`
> Package ID: `online.askbible.twa`

