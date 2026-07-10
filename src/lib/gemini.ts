/**
 * Общ Google Gemini API ключ (подаден при билд от GitHub Secret
 * VITE_TTS_API_KEY — стои само в готовия сайт, не в git). Ползва се за
 * TTS („Чуй") и за текстово търсене („Задай въпрос").
 */
export const GEMINI_API_KEY = import.meta.env.VITE_TTS_API_KEY as string | undefined
export const GEMINI_AVAILABLE = !!(GEMINI_API_KEY && GEMINI_API_KEY.length > 8)
