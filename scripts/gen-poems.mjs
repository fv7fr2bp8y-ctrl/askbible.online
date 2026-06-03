// Еднократен генератор на src/data/poems.ts от списъка със записи в Google Drive.
// Стартирай с:  node scripts/gen-poems.mjs
//
// Аудиото се стриймва директно от Google Drive (файловете са публични).
// Редът: водещите ("Избрано") са първи, после поетите; стиховете — по номер.
import { writeFileSync, existsSync } from 'node:fs'

// Истински портрети на поетите в Google Drive (Images/<Поет>/). Имат
// предимство пред локалните корици.
const poetPhoto = {
  vazov: '1e_vbzma_bsQ992VELCkVQdoJ16gK4b6A',
  yavorov: '1WA1zbc3_zRj5s81GC7LXKZs0wgu_C2wl',
  smirnenski: '1O-jcvAhVerQCaMgFGF8Gf2RffCL_gSXq',
  vaptsarov: '1yvMzAXTBrAXcCdzbweLAvhMmuq8TsfXN',
  bashev: '1gmLmBQbO7HOY0WIqxOWws3K3VM5QTwk5',
  damyanov: '13KOjC4Jxuynqt_Yu6h9ZkkoyPZ1AlnDB',
  germanov: '1pMc-4lIQaQMCUx2zaLBGP5fyHv9A0KGQ',
}

// Корица на поет: Drive портрет → локален .png → SVG постер.
const poetCover = (id) =>
  poetPhoto[id]
    ? `gdrive:${poetPhoto[id]}`
    : existsSync(new URL(`../public/covers/${id}.png`, import.meta.url))
      ? `covers/${id}.png`
      : `covers/${id}.svg`

// Схема "gdrive:<id>" — преобразува се към Drive API линка (с ключа)
// на едно място, в src/lib/asset.ts.
const driveUrl = (id) => `gdrive:${id}`

// Корица: локален път (съдържа "/") се ползва както е; иначе е Drive id.
const coverUrl = (v) => (v.includes('/') || v.includes(':') ? v : `gdrive:${v}`)

// Водещи записи (папка "Използвай тези стихове") — със собствени заглавия.
const featured = {
  id: 'izbrano',
  title: 'Избрано',
  description: 'Подбрани записи за начало.',
  cover: '1LKe2Wmg07q2wi_r-MxkxOZgnB8t8uAMO',
  poems: [
    { id: '1IkqyGmlq0HchAUYtQgmVwmzeRVjgEwpz', title: 'When I Die', author: 'Rumi', cover: '1LKe2Wmg07q2wi_r-MxkxOZgnB8t8uAMO' },
    { id: '1_xhBSHT9Gcer6XuMA8prkajR0WIQFrJN', title: 'Lose Yourself', author: 'Rumi', cover: '1LhEiIz5U29RqMKwCwAPFhULWKUG6571S' },
    { id: '1IKZmFptDe7xcA005yjtXkLcsOdR8FvLq', title: 'Fear', author: 'Kahlil Gibran', cover: '1_x-ezDF4-ut8lBM5SuEExum9LqLWSJ4X' },
  ],
}

// Поети: всеки ред е "<driveId> <номер> <заглавие>".
const poets = [
  {
    id: 'vazov', title: 'Иван Вазов', author: 'Иван Вазов',
    description: 'Патриархът на българската литература.',
    lines: `
1vGgGVdSCdIJIINkZd_QICY63MmZOISuU 12 Не се гаси туй, що не гасне
1OHpEWxf1RxbWOVSWa487BjyM6hx-GoSo 10 Опълченците на Шипка
1Jdi4kdyQjyMpnOMDXLozmHjFslEmc6mr 5 Паисий
1u4Mb8tWqrKdIL-K3lYePvfxAR4YdjgNq 11 Българският език
17gNe0xI0N9xOkBaaRnvu698n6M4lwtkb 14 Съзерцание
11E5BRe99ci0uqMrMne7812mW11Pkyols 7 Раковски
1lUbBNevrkTQ-mZrTB9FiZV-FlCOh_R9t 9 1876
1VSGl_6f9i6jyevr77WsBPB_kUDXtNUIh 15 Новото гробище на Сливница
1MoXNCjzyBmGevc4sxUnMlc0JpXxJlK5r 4 Каблешков
1en5-MqYa9eOkKSSW7xhkGB8tqhXUep_X 16 На България
1v9l1_Z8eUzxlbDpglknsOTr_OtIntmWj 13 В бъдещето
19Lbe5gnhG5RhexWyFRkFCscKNvDpvdr6 1 Левски
17AjqH4aG-38b3ASUTLyR16LfosceazZB 3 Кочо
1l0WH5SBB-Mgl74PJzdPA8kG7NwleT58z 6 Братя Миладинови
1qiXl3ek_mT71AbIqmhxhiI8af8q_cq1W 2 Бенковски
1gDJglPK_a5PKdQ3eu2Q1BE46TRN54LzW 8 Караджата`,
  },
  {
    id: 'yavorov', title: 'Пейо Яворов', author: 'Пейо Яворов',
    description: 'Символизъм, любов и революция.',
    lines: `
1phkUvQBEKbQJJvMnN84g2w0ElrYmbBvl 1 Недей ме пита
1a5Tgay2NaXmqn_cQ6IJSZABMFrPw4lbP 2 Калиопа
1uolfVac17ypxox0s7iL3-oGHn2l9tNeo 3 Арменци
10dtW6MBF9I-nptz5ntZ7b9LT4vdiTo-S 4 На нивата
1mwTsKu01pkmHhTObEVBo9eCMdqc9nxHu 5 Градушка
1vgRaoMyWuYDh4OBi7VBS1Sk2d6Kg48GD 6 Заточеници
16Uz07fYDpDm11erIq-ssyti07ntqn9wZ 7 Лист обрулен
1-P3vqn5wfyOq4BjpqsttYSV6QAE4XL3B 8 На един песимист
1hnyXSEO-OS7AdMDK7fIL41MzEUZTQmJY 9 Павлета делия и Павлетица млада
18i3UJ8T1_125ysfLkGxmdbSEjaj3acX1 10 Край огнището
19xlviPUrIdSsWNur6Y_r_cxB7U3GUuA9 11 Нощ
1NOYWXOTf0jOw5ie25swGMu2fswsnWO6p 12 Хайдушки песни
1yPXAPR7s1rn-JBhgJivo4_OCbtSHFgvF 13 Копнение
1ZrWCuqS7J0nVYYk3f-H88dtz4ey0BMsw 14 Ще дойдеш ти
1RfsJYP36UuE9cHt2A5B77afA9zB3aG5t 15 Не си виновна ти
1piZcAYSN0LKSJaDCgQSKp2reTTe0csJE 16 Напразно, майко
1R7Ga9B62TYYWYl-_krTB-nTnUwq3Sot7 17 Две хубави очи
1PeM1_W5eQOGfYGAuMcZAB3b2DWr19c0G 18 Блян, Вълшебница, Ела
1bKdEtHSWb5XkT3E365EauHWyCJdZIuvB 19 Благовещение
1hK7ZLIQvgokbXw2KtEMZ8_94rPfCczoB 20 Песен на песента ми
11gMTFDbJlA-OYiREYOLl4YCS9rx_cGOx 21 Ледена стена
16_UMlSGxCCPuhOIfgX89ozX0RWJ-WYjI 22 На Лора
1eCFfyKzxbtNqFeuViV1-1_QvRlqUO5DQ 23 Пръстен с опал
1HwFmZ_K91I0ht2evbsa_Cq6Ypifw9ZeP 24 Не бой се и ела
1dAljSiRy70OcpQrk-i1G5a9nl_agIGxT 25 Обичам те
1Cj6NoDD2ogbA0pYwp1dT3577F8GJmopW 26 Аз страдам
19Yf-KEUa7IQVRU8Mq1C9sLicjdhkLrv4 27 Ще бъдеш в бяло
1jMVxglaVVJvAhSd374XZT0wyAzIcII8- 28 Майска вечер
1C23HCYRw6oG6fwe5b9-0xMaWBp6wu5Y2 29 Две души
1cjc9jjyhjm6vOLFPpo1WjWR7eSaIvV8r 30 Родина
1n2Fv79Uh1JFTC1vg8LFBUOH44d-CS0y9 31 Молитва
1W2VRSEk9KlQjS4nG0_XA5lmb5qviQc7k 32 В часа на синята мъгла`,
  },
  {
    id: 'smirnenski', title: 'Христо Смирненски', author: 'Христо Смирненски',
    description: 'Градът, бедните и мечтата за ден.',
    lines: `
1U3qApb9Nm3NRCKvA8GewHAd_ue5EYGbZ 1 Горчиво кафе
1Z_knXBD1GzVDPBY8csi54mAYk3Rkv48d 2 Среднощни сенки
1qiaIA76GDJ03zCx2Mg-qcbXyCNwbwLB6 3 Стара приказка
1EZhWhi140b2Is3FnQ4aDFpdXoUFsoDxJ 4 Работникът
11t541gE2mhc3t9ZB-WUhMnsEhyNbjhPX 5 Вълкът
1I4-2te5b5GYpW0TRap3iSPrLgEs54Qz- 6 Старият музикант
1MUPlswS7FmTaTx3WpFAmAnAXbSYDh7c6 7 Братчетата на Гаврош
1c2qQp6g1FTCs6V_W4LF0tkg7VznOKU5S 8 Уличната жена
1JGCq3vGeufOsyHFqM4Z-yqMRflJNofJw 9 Каменарче
1zvN1_YYtlHrEhT4VrHgkwkT9MSll6DWd 10 Децата
1b_0kEpJGmuSjV9hm-qouPJOt-_qCFhGq 11 Ковачът
1m_3DIvBvzsqyJ5eL3qx84ogohTmRr3LX 12 Цветарка
1yi7VU92gNuWuruKHuczE142cbg1no6Li 13 Слепият
1jUwMyQykLMeR_uZWkf2Xp2xL2AN3iIOn 14 Юноша
1rUKXqr7X58MllOd2SJLKLy37xM_1j2rL 15 Погребение
1k2uxdn38StHM8YwJKjFnDyyacO3UWe5h 16 Жълтата гостенка
1AcMLX_3DKmM7gwG5NK7_oo35g_S8blfE 17 Зимни вечери
1iebzVDQtScf_OVMj03dYoeYouVQFKsy1 18 Йохан
1H_zMKJYMSkwmMKKkDCSNdZELupTKyB0t 19 Смъртта на Делеклюз
1yo-d0-GfWXmblHF8cefFXIw14pGTJFBx 20 Карл Либкнехт
1jRATxScagjytt2NQt-wA3LokkVTVmLjI 21 Роза Люксембург
1vDxsIcMtVsVkuTUSGbEYOb7dyWCriLWd 22 Москва
1CNvJAB0qSLlY93hMxubd4ZdJmYEdiwwX 23 Червените ескадрони
1UNZx60nmHoPIP1-wTNCWS2XOdSAp_aUS 24 Северния Спартак
1A53nI05SPinNcMMPkvRM0R9X1uQPo7un 25 Руския Прометей
1CvCjTpRN3SDj73M07x5HkEj3tupwHu4H 26 Приказка за стълбата
1iLn-lXsYgDHRYUShfrdGI_XCicjzIoxU 27 Босоногите деца
1GZ3VmsQdZDZNq2pUQEsYJQi93zpCPF40 28 Ний
1JfB6VsA6OvGu_sx7xSKL0PUnv6rXb_d_ 29 Тълпите
1ohNLLheWpZU6SLcnwmrASpLts-cFKEO6 30 Улицата
1sg-OYpm_tyK4Rgcfat7j1omu2wF46nvk 31 Въглекопач
1f15HGpU8Sy8NSRTnKrSGRgSViy6KJ4zT 32 Да бъде ден`,
  },
  {
    id: 'vaptsarov', title: 'Никола Вапцаров', author: 'Никола Вапцаров',
    description: 'Вяра, мотори и песен за човека.',
    lines: `
1NKGEOYvyPrlIbysTyumZg4MM5TKAkJKq 1 Вяра
1hHKhsozvFRa3ook0w-xBJ0w_TjXqrSX1 2 Пролет в завода
1Zr1eJfpFupnkU_ID0BgefHNzaJG523yB 3 Завод
1nfADIRqVZcVDSk89rLzS-hlSsTu304i8 4 Спомен
1s2guF8dj4pn6N4GIt3C07iPtVnT2XvvU 5 Романтика
1YWMqVXrMyqJsADcLQhefvSoZtb8O7E9k 6 Двубой
152zgmCdCRWGFmrOHWolb_Ga3gcveS_xT 7 Писмо (Ти помниш ли...)
164IbAuGZT13Mfv_baolkyivEHikde8t5 8 Песен за човека
1OE9JvFJUoy5EA0c2HNYH7CeF5zt8DbuG 9 Родина
1SMiRZY0khDL0XhvkVY70BJ2f8OBzIRVb 10 Песен
1knmLN0bvQsR4OGzOQ4exY0gngikCcKh- 11 Имам си родина
1xowpTSPhj0mtWqEiXE95VAKmwZMskdAF 12 Хайдушка
1KW2L0vAUzZlTEibpZFpVkS8QoUjIB384 13 Елтепска
1YPIyS5DDHRzCfVy0gDBOEAI9-Q5xIlAf 14 Огняроинтелигентска
1gkuh9GJ3fDkmdBdETQF2CgcAZS2CZXg1 15 Любовна
1X5VlF7CSQODosHoZBfj1dJ0KfsqB34bV 16 Испания
1MXHoAsq3fEenpd_kFnk1wXY-6qLfDbta 17 Сън
1pS2tpdwqU27X8xIs6v6_8J2Pq-udDPBh 18 Песен на другаря
1KOxV_zTa17KYRVa_fGoxorofhND5XGEP 19 Песен на жената
16ciFIIHGenVvAJqoky1-w6v1yhz4s1Rs 20 Писмо (майко, Фернандес убит...)
1AtcMvS8y8M_sdYmJcB7hrDmwwvg6_4Ap 21 Пролет
16RxpbpiecVUTwGFN0RGQycCgTN-esgaN 22 Един сляп
1eB_i3mFY7iFsrA5sMk6qb7hPd9sZM37t 23 Зора, събужда се градът
1EPfbpogJiIS5oYwyT6aoWYJEHPg40sWe 24 Ще строим завод
1JObkdbmSKoPpDJA0e4WaOnCFtwPT88p8 25 Горки
12bBSvRTH_qErMkTR9ClzEvn3-5ig8DTY 26 Епоха
1N0tx3EGLOGo1LI2MV7SMGw_REUoxuqb_ 27 Пушкин
1WkGFGg-1W0LT82MEOyqysimzaJVK6pb6 28 Хроника
16diDUG4iCyvToXa3BSqZ79H1EqEjTdT9 29 Не бойте се, деца
1hWlRSfPYViWtk-5dSHLUnC9u5tEbMLeL 30 Песен (Във гората - враг стаен...)
1b8V6Bp8j0jGLrAVWmhe0PByeOqQuXL8q 31 История
1JXohc86gbP9rD61g5zki_Vs3xF6zbV9V 32 Кино
1YFROx3lJgzridAV9UzUcoAx31jfWzu_y 33 Дохождат дни
1eLEEMK90nLE1X45F2LtabLbiXOll9_aD 34 Ботев
1TgvYzX5etQy9NXwM8VSaL8iOeJPTFURV 35 Прощално
1rCK1xzyP2FFe1okedoYWOfWCuGs9WIKJ 36 Борбата е безмилостно жестока`,
  },
  {
    id: 'bashev', title: 'Владимир Башев', author: 'Владимир Башев',
    description: 'Лирика на едно кратко, ярко поколение.',
    lines: `
1MmFu5vIww4f12s5iuEHpie9pgXm5nVOO 1 Размисъл
1Ip0hQ3nj4Zbk4hBDms6VAvdTPbleL34E 2 Жажда
10bw_X59TUbK7mR7TCVKMAp9KZlUzrF5j 3 Двадесет години
1JNVmEzf4Vd2EzzFt0vcM3VVbGvv_duAu 4 Осма симфония
1DEswcpF7Q6mNolCFvJPXKdZG2qXbmsYZ 5 Време
1e-FSkQ-fTy25Y4-EP9lxfNOOiQjEhOT1 6 Възраст
1YwyIijKpLzUIl9pul3DaH0YGRBDHoJmG 7 Изповед
1zoES5ZTlU_s-98LNeJX18a8HJSBeJRUM 8 Крематориум
1e4QtSneJUdYOpPEGEHDSRY8VJmRlI_PK 9 Полонеза
1uwW5aeNPmes39EbcSsP2yTWE-C-oe56b 10 Инфаркт
1oXG-OPnTkTzayp8ZBDJ_da0kNHp8Nniu 11 Тишина
1n0VfZHa2t1EbBMRIZiNJMfjZDLCaNWY4 12 Въпрос
1nb7p_N6TuETk4TZ64QRVxOtv60OwGjo1 13 Гара
1DAkA08I57dcOh1j7PmeH41kUjvr3VGzE 14 Човечество
1D6zuWng7_W2NNA15qaieWNVt5Y_flebj 15 Пред вагона
1vp17dIDGfPmSp6E_Swp17Yuo4RZs-5CV 16 Признание
12pM43J-jEivYFw-aAKT74bXbQkXkCtvL 17 Иконите останаха потресени
1tON5zj-Yni2MDoith9EHuQL5F9b6kngV 18 Епизод
1M3oQ8PW_NAE19Lers3wEjVNle9Du7Thy 19 Епилог
1xZmjfcFCUT5ZVnnC9TQAG0RIY8zSKLmy 20 Чаша ром
1xVu7ZLS_PLzcNiEpJfYrwsd4sag71IG5 21 Обичам
19AgRo1EoUIm5y02oPwVNeXQ7DP3nIXKm 22 Как късно всички вие ме целувате
1DUcV6a-qf34Uho4ZjqXZG3zBnZt4-bXL 23 Мамо
1iWuIloWlWgGqEpWJ_uT9Q6YA9lPsjIUK 24 Талант
16yKA6x7nlEsAxZOSx1eXPFhTynFL1_LU 25 Рисунка
10JysTTkwSZLg9rUOReVKh3fArokg6qBu 26 Следа в снега
1vMn-C038zsuzqwne_WD4euD7zdl-yc_h 27 Катастрофа
1Mv3iq8v73OFZn5MHs3Rxgh-PFb9Tmi0V 28 Прощаване в снежна вечер
1EvwdjF2W2zbaeKaj_gHRV82Pcs7l614T 29 Когато се запитвам за лицата
1Vqv1XKr_Y8gmiWAAeSG37UOunN8Z02-r 30 Пусни ме в мислите си
1g6X6Cmy3az_mp3Pf5r5UXNsribIure9E 31 Композитори
162rjUrOnJaNVYAldiuB1RQeBXNMkVZ7y 32 Кестен на тротоара
1C4s68HDiaYg6sEijJiiG9wsmQWCNzaKu 33 Балът на артистите
19R6XqXtcHl5wF91-F1O54f6ctD16RMwL 34 Ще умра на път, летейки
1fR7vhX9ZsfpujOuRJRmQBvbG0yUs_bHn 35 Движение
1FQsyCFhQBBAXEH9Ca-j6pmT84Is0tkZM 36 Реквием
16S5kti7Uj9m37tv8aQAYhJE-63UvZFs4 37 В най-есенния ден
1dE61I6bp5eqZaV5UtvA_KKAxgBvqHY-9 38 Пеещото дърво
1eN9Y2VOSxnXn8nqcgArL3eovEdxZan_W 39 Вятър черни къдели развлача
1HxcJhccaWYh91dk0Gq2MVjW3x-Z93R2T 40 Писмо
1Bx3HVRY9-RXIjng_wyj7i5jKGn2FhLYf 41 Желязото се учи да лети`,
  },
  {
    id: 'damyanov', title: 'Дамян Дамянов', author: 'Дамян Дамянов',
    description: 'Любов, болка и воля за живот.',
    lines: `
1NRhgplwgAVmmqXPPawr1gsSDN7KAZmXL 1 Старите стихотворения
1vn93jaZX9qQkcguqpjx1Uy4kic22nILK 2 Предсказание
1veoBcLxOIQ5VS7RX1wf5iOhHG8LD5n4s 3 Птиците
1fMIvbHqqc6giQ38RCRNaniJX0krL0Bf0 4 Писмо
1pFea2dKnuq4quaQam9J3I62-4CdQ1aP3 5 Аз исках да ти кажа две слова
1aBLcTxCjz7JoYJmcq4wFnMa24L2kuknR 6 Песен за теб
11_hIdP5gD1OpDkJf5donlEKB9KCwUKPY 7 Неизпратено писмо
1Ll7v902zVwdPaRLCbAS4tLIsjj-5cgne 8 Лунна соната
1OQtCd-UcNalUUzaGMus0BnBcAUYXB3T0 9 Неделя
1ouI6qAwZmf8VWP0yXy-cA5WAJTLCYSoy 10 Не си отивай! Чуваш ли, не тръгвай!...
154BNAHgQtBPbrItwbkpH2v9CCFqyUzZb 11 На сбогуване
1lI0N0h8LYIS2hK2pHI82H7Glhjtasoqx 12 Нашата сватба
1Kqu_ZXXzJGWQxdogvjv9mZWXgv7LRQkb 13 Когато радиото свири
15ahrg0UWpaF3EVFNCZKxX8iEnQ3UzBuZ 14 Дъжд
1uaHO_-EljusGHRkTntUcCwsU6qYrfVPc 15 Щурче
1QmRAC__8Aqepj19udLDPV43lcSzdUo4Z 16 Преди да дойде есента
1PmCJ7YFhJRs1NKL0jsVnfPsoBNTNTZKK 17 Чаровна си и приказна си, зимо!
1-3FuzZ6p8yP7dA_3-rVjE0ad14XuVrGb 18 Болезнено зелена тишина
1ldVfp0ekAfi6ijth0jQlyGXH1dWaxgpq 19 Интимно
1bjfryrWJW1gpauQnJpd0ateOvPUgTb-Q 20 Плът
1RtfA4gZhptWZlvefBRIJvfZ_0seFPma- 21 Сняг през март
1yQvd-jXWzczigDtUnOVp7fq-_-idbjIa 22 И хукнах да те търся по света
1uZa-Y4ot74SnI2NDL5QhXfT9p_cjmaQS 23 Когато те измислих, се уплаших
1iLQVdaHnZYkfJ-6uyfgKZ3gcGPzDj-Hh 24 Не трябва да те търся
1JtuMTE-m4R0CjcRMdlIE0-IbzImB_u8e 25 Нарекох те свой празник
1PuZrH0id_vYXG7yH492DWy3vZZg1TRoR 26 Не ме напускай ти до сетен час
1IHU6-W8Dtma-6Et0NxtwtYnDiOlIpluu 27 Мамо
1-ksPYurzh1xl1HTKotlUe37KFeEPnhIV 28 Художник
1xcKkWKmPY7WbiX4nHAdX_R20OnzR_QNq 29 Писмо от близо
11_VCyfCEqd2SmoIqx5tf0XTmYUrbhr5X 30 Неродено мое
113_dcZHQp44SEnpdPZKlEopN60q5KU9L 31 Запознаване
18SvPKghkEOdwi5OSTuH3QDRT6xEanoPT 32 Градинско стрелбище
1k-2GC9p4o7S6xYtNc_VnZg8dfL-5llru 33 Поезия
1upDBIP8FK4kJCGA4DbsoC9BmTQ7-FikH 34 Ръкописи
1yWyeh18Tski7qAP0sUbNzAMbEStcLRG7 35 Софийски пролог
1nbliev2FKYKpBWgjVzzRa5iuQ0giiU_V 36 Лежа в тревата
1fKFDFzP1aOw1detx_HDl5Y7IQUc-PVjE 37 Всичко, което...
1A-B-OMlIgQdGpxr8uAeo1VzbkYZLo9m5 38 Петлето
1dnSXvX9c9qSwlR1DtbZbBGtBr0y6md17 39 18-и януари
15zwdaKpLU7X7IxxwCL_63q1o63O04NF- 40 Ако аз не ходя
1GgqP2oPR6M8lv2Pa_9AEWWrZzhnvdgPe 41 Въздухът опива...
19mnHDvFuevR-Kkkt-8fH1M4tXMrPyzbU 42 Боже мой, откога не съм писал
1HREuOK8j4WmigGiGvFDrwDL1ZSJY79q2 43 Със зелени байрачета махат
1C2HdvpeRnW6Z873w707wr46PivlPk3lh 44 Пак ухае на цвят
1xWhlGQqWDzn6eK_NwSjrem7CNOhTh_g6 45 Дон Кихоте, близко е Ламанча
1CMijVoklv_snEdoiIRHI_6hAkILT7Bl- 46 И какво повече`,
  },
  {
    id: 'germanov', title: 'Андрей Германов', author: 'Андрей Германов',
    description: 'Тиха, изповедна лирика.',
    lines: `
1fRDv7FfpABgWJZbaI9yOaUWUvS0iTTBF 1 Годините не ми отнеха
1Xq_zmlPBRSy0ntR9yor5u1mdBZdTrdc6 2 Приказка за одъра
1y1-l7hsYBKTYSRhGRwuuyUSRihFqwA3T 3 Тримата
1b3w4YpIB3wswK9IiM-neFjeoYuJZ6QXK 4 Белоруски снегове
1Dy2EJSQiItyIqjITKfJsAvziZBTFRwjw 5 Паметник под връх Персенк
1jCbnqJRjtGCebiIXCVtb593pUse0-6AY 6 Посвещение
1nTpLxQRjWAG78B9HgPY3frPyNYKuZbAb 7 Сенките на загиналите
1k_XBy6SAzAuo_N5TkP7RY-q871azaqyE 8 Ах, как умират селските жени
11TciVaXMndcRiN3d-_5EBEQNmCjmb91I 9 Обяснение в нелюбов
1gNb1M1IATjxdsZz6I8F1EOUJIHhz4_iB 10 Вярност
1dqCMs7lnhg7jzM_1G-X4PfKXjMJPd7Zh 11 Ще дойде и за мене оня праг
12wVE-apbx2OvUsTv8bUa6CHoXfMY2Hrp 12 Когато много ме боли
1O33mQMN-r9ZI9Q2PKQ31Ag8A-HuEQElV 13 Заклинание
1EOqgizDkS2rNIVl5X7au9yPtSiouL54b 14 Аз вярвам в непостигнати неща
1uhvMcNeUyfbkQeZBpFcgJuxn0kEBYWTu 15 Мостът
12Wfx4NflOS3z1BENSAFAsWwFCxeOc5JO 16 Маслини
1dO8neu_ThUXTpRNsB_TpDjPERK76cK5o 17 Мълчаливият разум
1xKSXWCBhj69qLkXrWjWLwkCes4tXxnAb 18 Свечеряване
1pHcTtXbfhg8Lb5-xDr3ExmnsE8vX5Nk_ 19 В най-бялата от всички бели нощи
1yVJbbchSAM1NZlrihFdfHhrcN1hQXg79 20 Във чашата ми дъхав цвят се рони
18vLuvuFERy_jJz66hqFC1Fi9kY-ftvWF 21 По хълмите, от синьото прегръщани
1Hi4C9PEAqLWFnZ1fplppPZFvKo1aczue 22 Звукът все още съществува
1CZT4sxPPnK96R3d189KrLFrWJM6RXgcv 23 Дъждовете
1Eez4hZQZdcVCo3NrIGpif7Oaeh8ZmXKG 24 След всичкото, което преживях
1tamm2IL4H6fzuvIqxGbgxEaJAxQwRN1b 25 Под ореха
1M9EvTj4lxmlgbn4TPAnPAs4IFSs1w3xo 26 Дивачка
13vU59I9lZP7K4oUGA1Q7gjMwxoWU4A0C 27 Не зная тайната на стиховете
1haHC7XvUoXJ7UX9W3KY0FQuwytYDZEvc 28 По скалата бръшлян
1m0yrzEd36OuPCEVrgsl7h-ZbduK41ark 29 Навън ще падне скоро ранен сняг
19kArzhik09Ell0CcWnZAi4h1WU9rPAXN 30 Летете, късни жерави
11e32tHXYk2VoZwNQBRSct6kMq0wGwGsx 31 Четиристишия
1KrXOUKG9FBRV4l_-I6nszWRKo5_qEQr3 32 Аз пиша
1JuCbnMVZdHHMIGawgafgQMUnRicW0E92 33 Изостаналият щъркел
1FvLpxh1o4tsZOVU6jsEt2z2oZk_9ZsdV 34 Сега, когато мен ме смятат слаб
1_AOxpXy0zZJDlL3PUJJ69BHqCO66m2KF 35 Седял съм под загасващото слънце
1F9TK3WzmPQSqYybW33joV5mnQBMqJzte 36 Край огъня полека ще приседна
1qGEZ3hDsziW4jP_qOqWG-HfFStccSofh 37 Момичето
1bRIOMoupPMHnO7OJQb5HWe91v5HGF2cl 38 Когато болката...`,
  },
]

function parseLines(text) {
  return text.trim().split('\n').map((line) => {
    const sp = line.indexOf(' ')
    const id = line.slice(0, sp)
    const rest = line.slice(sp + 1)
    const m = rest.match(/^(\d+)\s+(.*)$/)
    return { id, track: Number(m[1]), title: m[2].trim() }
  })
}

const albums = []
albums.push(featured)
for (const p of poets) {
  const cover = poetCover(p.id)
  const poems = parseLines(p.lines)
    .sort((a, b) => a.track - b.track)
    // Всеки стих ползва портрета на поета и за миниатюрата си.
    .map(({ id, title }) => ({ id, title, author: p.author, cover }))
  albums.push({
    id: p.id,
    title: p.title,
    description: p.description,
    cover,
    poems,
  })
}

// Сериализираме като TypeScript.
const fmtPoem = (po) => {
  const f = [
    `id: ${JSON.stringify(po.id)}`,
    `title: ${JSON.stringify(po.title)}`,
    `author: ${JSON.stringify(po.author)}`,
    `audio: ${JSON.stringify(driveUrl(po.id))}`,
  ]
  // Английско аудио, ако е генерирано (public/audio-en/<id>.mp3).
  if (existsSync(new URL(`../public/audio-en/${po.id}.mp3`, import.meta.url)))
    f.push(`audioEn: ${JSON.stringify(`audio-en/${po.id}.mp3`)}`)
  if (po.cover) f.push(`cover: ${JSON.stringify(coverUrl(po.cover))}`)
  return `      { ${f.join(', ')} },`
}

const body = albums
  .map(
    (a) => `  {
    id: ${JSON.stringify(a.id)},
    title: ${JSON.stringify(a.title)},
    description: ${JSON.stringify(a.description)},${a.cover ? `\n    cover: ${JSON.stringify(coverUrl(a.cover))},` : ''}
    poems: [
${a.poems.map(fmtPoem).join('\n')}
    ],
  },`,
  )
  .join('\n')

const out = `import type { Album } from '../types'

/**
 * Съдържанието на "Тих Стих".
 *
 * ГЕНЕРИРАН ФАЙЛ — не редактирай ръчно.
 * Източник: scripts/gen-poems.mjs  (стартирай: node scripts/gen-poems.mjs)
 *
 * Аудиото се стриймва директно от Google Drive (файловете са публични).
 * Албумите служат и за категории (чиповете в библиотеката).
 */
export const albums: Album[] = [
${body}
]
`

writeFileSync(new URL('../src/data/poems.ts', import.meta.url), out)
const total = albums.reduce((n, a) => n + a.poems.length, 0)
console.log(`Записани ${albums.length} албума, ${total} стиха в src/data/poems.ts`)
for (const a of albums) console.log(`  ${a.title}: ${a.poems.length}`)
