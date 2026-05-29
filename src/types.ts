export interface Poem {
  /** Уникален идентификатор, използва се и в URL за споделяне. */
  id: string
  /** Заглавие на стиха. */
  title: string
  /** Автор на стиха (по желание). */
  author?: string
  /** Път до аудио файла, спрямо public/, напр. "/audio/moiat-stih.mp3". */
  audio: string
  /** Път до обложката, спрямо public/, напр. "/covers/moiat-stih.jpg". */
  cover?: string
  /** Текстът на стиха (по желание) — показва се под плейъра. */
  text?: string
  /** Продължителност в секунди (по желание, само за показване). */
  duration?: number
}

export interface Album {
  /** Уникален идентификатор на албума/категорията. */
  id: string
  /** Заглавие на албума/категорията. */
  title: string
  /** Кратко описание (по желание). */
  description?: string
  /** Обложка на албума (по желание). */
  cover?: string
  /** Стиховете в този албум. */
  poems: Poem[]
}
