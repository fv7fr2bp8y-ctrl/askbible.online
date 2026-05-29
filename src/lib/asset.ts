import { driveMediaUrl } from './drive'

/**
 * Прави път до асет (аудио, обложка) използваем от браузъра.
 *
 * - "gdrive:<id>"  → Drive API media URL (с ключа) за стрийминг от Google Drive
 * - "http(s)://…"  → връща се както е
 * - "/path"        → префиксва се с base-а на сайта (import.meta.env.BASE_URL)
 */
export function assetUrl(path: string): string {
  if (path.startsWith('gdrive:')) return driveMediaUrl(path.slice('gdrive:'.length))
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return base + (path.startsWith('/') ? path : '/' + path)
}
