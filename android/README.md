# Android (TWA) пакет за Google Play

Самият `.aab` пакет не може да се компилира в тази cloud среда (сървърите на
Google за Android SDK — `dl.google.com` — са блокирани от мрежовата политика).
Затова пакетът се прави по един от двата начина по-долу. Всичко останало (сайт,
manifest, икони, assetlinks, privacy) вече е готово.

`twa-manifest.json` тук съдържа точните настройки (package id, домейн, цветове,
икони, ориентация). Използвай го и в двата варианта.

---

## Вариант A — PWABuilder (най-лесно, в браузъра, без инсталации)
1. Отвори **https://www.pwabuilder.com**
2. Въведи `https://askbible.online` → **Start**
3. Секция **Android** → **Generate Package**
4. В настройките: **Package ID** = `online.askbible.twa`, **App name** =
   `Pregúntale a la Biblia`. Останалото се чете от manifest-а.
5. Свали ZIP-а → вътре има `.aab` (за качване) и `assetlinks.json`
   (с отпечатъка — ще ти трябва за следващата стъпка).

## Вариант B — Bubblewrap (локално, ако имаш Node + Android тулчейн)
```bash
npm i -g @bubblewrap/cli
cd android
bubblewrap init --manifest=./twa-manifest.json   # или: bubblewrap init --manifest https://askbible.online/manifest.webmanifest
bubblewrap build
```
`bubblewrap` ще си свали JDK/Android SDK сам (нужен е достъп до `dl.google.com`).
Резултат: `app-release-bundle.aab` + keystore (пази го — трябва за всички
бъдещи обновления).

---

## След като имаш `.aab` (и двата варианта)
1. **Play Console** ($25 еднократно) → Create app → качи `.aab` в Internal testing.
2. **App signing** → копирай **SHA-256** → дай го на мен, слагам го в
   `public/.well-known/assetlinks.json` и пускам деплой (маха адресната лента).
3. Store listing: визуалите и текста са готови — виж `docs/google-play.md`.
   Privacy: `https://askbible.online/privacy.html`.
