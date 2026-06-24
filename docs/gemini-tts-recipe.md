# Как да добавиш естествен глас (Text-to-Speech) през Google Gemini TTS

Дай това на асистента в другия проект. Стъпките са изпробвани в работещ продукт.

## Цел
Бутон „Чуй", който чете подаден текст на глас с естествен неврален глас
(работи за български и английски, и още десетки езици) през **Google Gemini TTS**.
Безплатно достъпен през `generativelanguage.googleapis.com`, звучи човешки.

## Точни параметри (работещи)
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=<KEY>`
- Модел: `gemini-2.5-flash-preview-tts`
- Глас: `Schedar` (мъжки, спокоен).
  Други: Algenib, Charon, Iapetus, Sadaltager (мъжки); Aoede, Kore, Leda,
  Vindemiatrix, Despina (женски).
- Тяло на заявката:
```json
{
  "contents": [{ "parts": [{ "text": "<ТЕКСТЪТ ЗА ЧЕТЕНЕ>" }] }],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": { "voiceConfig": { "prebuiltVoiceConfig": { "voiceName": "Schedar" } } }
  }
}
```

## Критични уроци (без тях не работи стабилно)
1. **Подавай САМО самия текст.** Никакви стилови инструкции от рода на
   „прочети спокойно…". Те карат модела понякога да върне ТЕКСТ вместо аудио →
   тишина. Измерено: със стилова инструкция ~4/5 успех; с чист текст 5/5.
2. Отговорът е **суров PCM** (`audio/L16;rate=24000`, base64 в
   `candidates[0].content.parts[0].inlineData.data`). Браузърът не свири суров
   PCM — **опаковай го в WAV** (44-байтов хедър, mono, 16-bit, rate от mimeType),
   после `new Audio('data:audio/wav;base64,'+...)`.
3. **Един повторен опит** при празен отговор; **кеширай** по (текст+глас) за
   мигновено повторно пускане.
4. **Предварително зареждай** текста наум при показване, та „Чуй" да е без
   забавяне.
5. (По избор) Browser SpeechSynthesis като резерв звучи роботски — по-добре без
   него: ако Gemini не върне аудио, не свири нищо.

## Сигурност на ключа (научено с цената на блокиран ключ)
- Ключът е публичен client-side (като Google Maps ключ). **НЕ го хардкодвай в
  кода/git** — Google сканира публични репа и автоматично деактивира ключа.
- Подавай го при билд от **CI secret** (за Vite: env `VITE_TTS_API_KEY`,
  подадена от GitHub Secret) → влиза само в готовия бъндъл, не в историята.
- Създай ключа от **Google AI Studio** (https://aistudio.google.com/apikey),
  включи **Generative Language API** на проекта, и ограничи ключа по
  **HTTP referrer** до твоя домейн.
- Ако проектът има бекенд — дръж ключа на сървъра и викай Gemini оттам (тогава
  ключът изобщо не се излага).

## Готов код (TypeScript, рамка-независим)
```ts
const KEY = import.meta.env.VITE_TTS_API_KEY as string | undefined
const MODEL = 'gemini-2.5-flash-preview-tts'
const VOICE = 'Schedar'
const cache = new Map<string, string>()

function pcmToWavUrl(pcm: Uint8Array, rate: number): string {
  const b = new ArrayBuffer(44 + pcm.length), dv = new DataView(b)
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
  w(0, 'RIFF'); dv.setUint32(4, 36 + pcm.length, true); w(8, 'WAVE'); w(12, 'fmt ')
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true)
  dv.setUint32(24, rate, true); dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true)
  dv.setUint16(34, 16, true); w(36, 'data'); dv.setUint32(40, pcm.length, true)
  new Uint8Array(b, 44).set(pcm)
  let s = ''; const u = new Uint8Array(b)
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000))
  return 'data:audio/wav;base64,' + btoa(s)
}

async function once(text: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } } },
    }),
  })
  if (!res.ok) return null
  const p = (await res.json())?.candidates?.[0]?.content?.parts?.[0]?.inlineData
  return p?.data ? p : null
}

/** Пуска текста на глас; връща <audio> или null. */
export async function speak(text: string): Promise<HTMLAudioElement | null> {
  if (!KEY) return null
  if (!cache.has(text)) {
    let p = await once(text); if (!p) p = await once(text); if (!p?.data) return null
    const rate = parseInt((p.mimeType?.match(/rate=(\d+)/) || [])[1] || '24000', 10)
    const raw = atob(p.data), pcm = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) pcm[i] = raw.charCodeAt(i)
    cache.set(text, pcmToWavUrl(pcm, rate))
  }
  const a = new Audio(cache.get(text)!); await a.play(); return a
}
```

## Бекенд вариант (Node)
Същата заявка; вместо WAV data URL запиши файл:
PCM → WAV буфер (същия 44-байтов хедър) → `fs.writeFileSync('out.wav', wav)`.
За MP3 ползвай `lamejs` (чист JS енкодер) или ffmpeg.
