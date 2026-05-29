import type { Album } from '../types'

/**
 * Съдържанието на "Тих Стих".
 *
 * За да добавиш нов стих:
 * 1. Сложи аудио файла в `public/audio/`  (напр. public/audio/dom.mp3)
 * 2. (по желание) обложка в `public/covers/`
 * 3. Добави запис тук с път, започващ с / (без "public").
 *
 * Албумите служат и за категории (чиповете в библиотеката).
 */
export const albums: Album[] = [
  {
    id: 'germanov',
    title: 'Андрей Германов',
    description: 'Стихове в негово изпълнение.',
    poems: [
      { id: 'trimata', title: 'Тримата', author: 'Андрей Германов', audio: '/audio/03-trimata.mp3', duration: 88 },
      { id: 'beloruski-snegove', title: 'Белоруски снегове', author: 'Андрей Германов', audio: '/audio/04-beloruski-snegove.mp3', duration: 107 },
      { id: 'pametnik-persenk', title: 'Паметник под връх Персенк', author: 'Андрей Германов', audio: '/audio/05-pametnik-persenk.mp3', duration: 94 },
      { id: 'senkite-na-zaginalite', title: 'Сенките на загиналите', author: 'Андрей Германов', audio: '/audio/07-senkite-na-zaginalite.mp3', duration: 78 },
      { id: 'vyarnost', title: 'Вярност', author: 'Андрей Германов', audio: '/audio/10-vyarnost.mp3', duration: 24 },
      { id: 'kogato-mnogo-me-boli', title: 'Когато много ме боли', author: 'Андрей Германов', audio: '/audio/12-kogato-mnogo-me-boli.mp3', duration: 80 },
      { id: 'zaklinanie', title: 'Заклинание', author: 'Андрей Германов', audio: '/audio/13-zaklinanie.mp3', duration: 50 },
      { id: 'az-vyarvam', title: 'Аз вярвам в непостигнати неща', author: 'Андрей Германов', audio: '/audio/14-az-vyarvam.mp3', duration: 57 },
      { id: 'maslini', title: 'Маслини', author: 'Андрей Германов', audio: '/audio/16-maslini.mp3', duration: 96 },
      { id: 'malchaliviyat-razum', title: 'Мълчаливият разум', author: 'Андрей Германов', audio: '/audio/17-malchaliviyat-razum.mp3', duration: 62 },
      { id: 'dazhdovete', title: 'Дъждовете', author: 'Андрей Германов', audio: '/audio/23-dazhdovete.mp3', duration: 77 },
      { id: 'pod-oreha', title: 'Под ореха', author: 'Андрей Германов', audio: '/audio/25-pod-oreha.mp3', duration: 82 },
      { id: 'divachka', title: 'Дивачка', author: 'Андрей Германов', audio: '/audio/26-divachka.mp3', duration: 47 },
      { id: 'ne-znaya-taynata', title: 'Не зная тайната на стиховете', author: 'Андрей Германов', audio: '/audio/27-ne-znaya-taynata.mp3', duration: 74 },
      { id: 'izostanaliyat-shtarkel', title: 'Изостаналият щъркел', author: 'Андрей Германов', audio: '/audio/33-izostanaliyat-shtarkel.mp3', duration: 142 },
    ],
  },
]
