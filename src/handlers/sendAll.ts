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
      'Наше приложение "Автоюрист Володя" теперь доступно в App Store!\n\n' +
        'Ссылка на приложение для владельцев "яблочных" гаджетов - https://apple.co/3HPCu1V\n\n' +
        ' Пользуйтесь и будьте здоровы в Новом Году!'
    )
    if (i == 29) {
      sleep(1000)
      i = 0
    }
  })
}
