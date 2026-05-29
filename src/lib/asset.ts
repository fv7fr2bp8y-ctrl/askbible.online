/**
 * Прави път до асет (аудио, обложка) съвместим с base пътя на сайта.
 *
 * При деплой на GitHub Pages сайтът живее в подпапка (напр. /TihStih/),
 * затова абсолютните пътища като "/audio/x.mp3" трябва да се префиксват
 * с base-а от Vite (import.meta.env.BASE_URL).
 */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return base + (path.startsWith('/') ? path : '/' + path)
}
