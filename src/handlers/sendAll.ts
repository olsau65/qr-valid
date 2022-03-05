import { findAllUsers } from '@/models'
import { Context } from 'telegraf'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function sendAll(ctx: Context) {
  const all = await findAllUsers()
  let i = 0
  all.forEach(function (message) {
    i += 1
    ctx.telegram.sendMessage(
      message.id,
      'Тестирование нового бота!\n\n' +
        'Ссылка на yandex - https://yandex.ru\n\n' +
        'Будьте здоровы!'
    )
    if (i == 29) {
      sleep(1000)
      i = 0
    }
  })
}
