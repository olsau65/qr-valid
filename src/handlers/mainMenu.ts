import { Markup } from 'telegraf'

export function getMainMenu() {
  return Markup.keyboard([['Авторизация', 'Мои чеки'], ['Проверка чека']])
    .oneTime(false)
    .resize()
}
