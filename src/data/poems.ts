import type { Album } from '../types'

/**
 * Съдържанието на "Тих Стих".
 *
 * Това е единственото място, което редактираш, за да добавяш стихове.
 * 1. Сложи аудио файла в `public/audio/`  (напр. public/audio/dom.mp3)
 * 2. Сложи обложката в `public/covers/`   (напр. public/covers/dom.jpg)
 * 3. Добави запис тук с пътищата (започващи с / — без "public").
 *
 * Албумите играят роля и на категории (чиповете в библиотеката).
 * Примерните записи по-долу са заместители — замени ги със своите.
 */
export const albums: Album[] = [
  {
    id: 'liubov',
    title: 'Любов',
    description: 'Стихове за обичта.',
    poems: [
      {
        id: 'tih-stih',
        title: 'Тих стих',
        author: 'Неизвестен',
        audio: '/audio/example.mp3',
        text: 'Тук ще се покаже текстът на стиха,\nкогато го добавиш в данните.',
        tags: ['Искрено', 'Дълбоко'],
        duration: 95,
      },
    ],
  },
  {
    id: 'priiatelstvo',
    title: 'Приятелство',
    description: 'За хората до нас.',
    poems: [
      {
        id: 'priiatel',
        title: 'Приятел',
        author: 'Неизвестен',
        audio: '/audio/example.mp3',
        text: 'Примерен стих за приятелството —\nзамени го със свой запис.',
        tags: ['Топло', 'Класика'],
        duration: 120,
      },
    ],
  },
  {
    id: 'blagodarnost',
    title: 'Благодарност',
    description: 'Думи на признателност.',
    poems: [
      {
        id: 'blagodarya',
        title: 'Благодаря',
        author: 'Неизвестен',
        audio: '/audio/example.mp3',
        text: 'Примерен стих за благодарността —\nзамени го със свой запис.',
        tags: ['Нежно'],
        duration: 80,
      },
    ],
  },
]
