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
      'Бот переехал на новый сервер. Надеемся, что работа с ним станет для вас комфортнее!\n\n' +
        'Проверяйте и сохраняйте ваши чеки!'
    )
    if (i == 29) {
      sleep(1000)
      i = 0
    }
  })
}
