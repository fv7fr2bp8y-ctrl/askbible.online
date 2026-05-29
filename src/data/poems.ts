import type { Album } from '../types'

/**
 * Съдържанието на "Тих Стих".
 *
 * Това е единственото място, което редактираш, за да добавяш стихове.
 * 1. Сложи аудио файла в `public/audio/`  (напр. public/audio/dom.mp3)
 * 2. Сложи обложката в `public/covers/`   (напр. public/covers/dom.jpg)
 * 3. Добави запис тук с пътищата (започващи с / — без "public").
 *
 * Примерните записи по-долу са заместители — замени ги със своите.
 */
export const albums: Album[] = [
  {
    id: 'nachalo',
    title: 'Начало',
    description: 'Първите записани стихове.',
    cover: '/covers/placeholder.svg',
    poems: [
      {
        id: 'tih-stih',
        title: 'Тих стих',
        author: 'Неизвестен',
        audio: '/audio/example.mp3',
        cover: '/covers/placeholder.svg',
        text: 'Тук ще се покаже текстът на стиха,\nкогато го добавиш в данните.',
      },
    ],
  },
]
