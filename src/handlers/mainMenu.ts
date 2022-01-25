import { Markup } from 'telegraf'

export function getMainMenu() {
  return Markup.keyboard([
    ['Обязанности инспектора', 'Ваши права'],
    ['Нарушения инспектора', 'Протокол'],
    ['Обгон', 'Скорость', 'Пешеход'],
    ['Алкоголь', 'Тонировка', 'Меню >>'],
  ])
    .oneTime(false)
    .resize()
}

export function getMainMenu1() {
  return Markup.keyboard([
    ['Грязный знак', 'Ремень'],
    ['Техосмотр', 'ОСАГО', 'Взятка'],
    ['Осмотр', 'Досмотр', 'Обочина'],
    ['Забыли документы', '<< Меню'],
  ])
    .oneTime(false)
    .resize()
}
