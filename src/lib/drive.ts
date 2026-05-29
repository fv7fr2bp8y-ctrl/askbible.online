/**
 * Google Drive API ключ за стрийминг на публичните файлове.
 *
 * Аудиото и кориците се сервират през Drive API media endpoint:
 *   https://www.googleapis.com/drive/v3/files/<ID>?alt=media&key=<KEY>
 * който (за разлика от drive.google.com/uc?...) се пуска нормално в браузър,
 * с CORS и поддръжка на превъртане.
 *
 * Ключът е публичен (client-side) — ограничи го в Google Cloud до:
 *   - API: само "Google Drive API"
 *   - HTTP referrers: https://tihstih.eu/*  и  https://www.tihstih.eu/*
 *
 * Може да се подаде и при билд чрез VITE_DRIVE_API_KEY.
 */
export const DRIVE_API_KEY: string =
  (import.meta.env.VITE_DRIVE_API_KEY as string | undefined) ??
  'AIzaSyD837Xsi3__ncRI0ZArFHl0F5Yq3M_KvGA'

/** Преобразува "gdrive:<id>" към пълен Drive API media URL. */
export function driveMediaUrl(id: string): string {
  return `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${DRIVE_API_KEY}`
}
