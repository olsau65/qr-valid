import { Context, Markup } from 'telegraf'
import { localeActions } from './handlers/language'
// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// Dependencies
import { bot } from '@/helpers/bot'
import { UserModel } from '@/models/User'
import { findAllUsers } from '@/models/User'
import { findAllCommands } from '@/models/Command'
import { ignoreOldMessageUpdates } from '@/middlewares/ignoreOldMessageUpdates'
import { sendHelp } from '@/handlers/sendHelp'
import { sendAll } from '@/handlers/sendAll'
import { i18n, attachI18N } from '@/helpers/i18n'
import { setLanguage, sendLanguage } from '@/handlers/language'
import { getMainMenu, getMainMenu1 } from '@/handlers/mainMenu'
import { attachUser } from '@/middlewares/attachUser'
import { attachCommand } from '@/middlewares/attachCommand'
import { protocolScene } from './handlers/protocol'
import { dutiesScene } from './handlers/dutiesOfficer'
import { dirtyScene } from './handlers/dirty'
import { violationsScene } from './handlers/violationsOfficer'
import { beltScene } from './handlers/belt'
import { speedScene } from './handlers/speed'
import { rightsDriverScene } from './handlers/rightsDriver'
import { alcoholScene } from './handlers/alcohol'
import { overtakeScene } from './handlers/overtake'
import { pedestrianScene } from './handlers/pedestrian'
import { tintScene } from './handlers/tint'
import { checkListScene } from './handlers/checkList'
import { bribeScene } from './handlers/bribe'
import { insuranceScene } from './handlers/insurance'
import { screeningScene } from './handlers/screening'
import { inspectionScene } from './handlers/inspection'
import { rememberScene } from './handlers/remember'
import { roadsideScene } from './handlers/roadside'

// Middlewares
bot.use(ignoreOldMessageUpdates)
bot.use(attachUser)
bot.use(i18n.middleware(), attachI18N)

// Commands
bot.start((ctx) =>
  ctx.replyWithHTML(
    'Привет! Я - ассистент Володя. Помогаю правильно общаться с инспектором ДПС.\n\n' +
      'Главное помните - вы невиновны, пока СУД не доказал обратное.\n\n' +
      'Держитесь спокойно и уверенно.\n\n' +
      'Включите запись на телефоне или видеорегистраторе или попросите об этом пассажиров. И вы и инспектор имеете право на аудио- и видеофиксацию.\n\n' +
      'Приоткройте боковое окно - офицер должен подойти и представиться (смотрите в меню <b>"Обязанности инспектора"</b>).',
    getMainMenu()
  )
)
bot.command('help', sendHelp)
bot.command('language', sendLanguage)
bot.command(process.env.MSG, sendAll)
bot.command('stats', async (ctx) => {
  const all_users = await findAllUsers()
  const all_commands = await findAllCommands()
  ctx.replyWithHTML(
    'Amount of users: ' +
      String(all_users.length) +
      '\n' +
      'Amount of commands: ' +
      String(all_commands.length) +
      '\n' +
      'Количество просмотров:'
  )
  all_commands.forEach(function (com_info) {
    ctx.replyWithHTML(
      String(com_info.command_name) + ': ' + String(com_info.counter)
    )
  })
})

bot.hears('Меню >>', (ctx) => {
  ctx.replyWithHTML(
    'Навигация по меню и ПДД',
    Markup.inlineKeyboard([
      Markup.button.url(
        'ПДД',
        'http://www.consultant.ru/document/cons_doc_LAW_2709/824c911000b3626674abf3ad6e38a6f04b8a7428/'
      ),
      Markup.button.callback('На стр.2 >>', 'MainMenu1'),
    ])
  )
})
bot.hears('<< Меню >>', (ctx) => {
  ctx.replyWithHTML(
    'Навигация по меню и ПДД',
    Markup.inlineKeyboard([
      Markup.button.callback('<< На стр.1', 'MainMenu'),
      Markup.button.url(
        'ПДД',
        'http://www.consultant.ru/document/cons_doc_LAW_2709/824c911000b3626674abf3ad6e38a6f04b8a7428/'
      ),
      Markup.button.callback('На стр.3 >>', 'MainMenu2'),
    ])
  )
})
bot.hears('<< Меню', (ctx) => {
  ctx.replyWithHTML(
    'Навигация по меню и ПДД',
    Markup.inlineKeyboard([
      Markup.button.callback('<< На стр.1', 'MainMenu'),
      Markup.button.url(
        'ПДД',
        'http://www.consultant.ru/document/cons_doc_LAW_2709/824c911000b3626674abf3ad6e38a6f04b8a7428/'
      ),
    ])
  )
})

bot.hears('Обгон', (ctx) => {
  attachCommand('Обгон'),
    ctx.replyWithHTML(
      overtakeScene(),
      Markup.inlineKeyboard([
        Markup.button.url(
          'решение ВС РФ',
          'http://www.vsrf.ru/press_center/mass_media/26545/'
        ),
        Markup.button.callback('<< Назад', 'MainMenu'),
      ])
    )
})

bot.hears('Тонировка', (ctx) => {
  attachCommand('Тонировка'),
    ctx.replyWithHTML(
      tintScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu')])
    )
})

bot.hears('Обязанности инспектора', (ctx) => {
  attachCommand('Обязанности инспектора'),
    ctx.replyWithHTML(
      dutiesScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'п.45,52 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/66c419ccc3c1b8205260739743cce08ca7b92cb5/'
          ),
          Markup.button.url(
            'ст.5 Закона О полиции',
            'http://www.consultant.ru/document/cons_doc_LAW_110165/50d6a5fc9ad995f3efca10bca062875531f1d30f/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu'),
        ],
        { columns: 2 }
      )
    )
})

bot.hears('Пешеход', (ctx) => {
  attachCommand('Пешеход'),
    ctx.replyWithHTML(
      pedestrianScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'п.1 ПДД',
            'http://www.consultant.ru/document/cons_doc_LAW_2709/5894b193fda5648afe1c1a5e70c028f25cd29099/'
          ),
          Markup.button.url(
            'п.14.1 ПДД',
            'http://www.consultant.ru/document/cons_doc_LAW_2709/7c45508e360f5b7b8ae1443d73feb01f52a6199d/'
          ),
          Markup.button.url(
            'ст.26.11 КоАП',
            'http://www.consultant.ru/cons/cgi/online.cgi?from=310131-11637&req=doc&rnd=C3C6E808E7EB69228BE01CF386778992&base=LAW&n=388938&stat=srcfld%3D134%26src%3D1000000001%26fld%3D134%26code%3D65535%26page%3Dinfo%26p%3D0%26base%3DLAW%26doc%3D310131#B8vmdgSC6G9HWxoP1'
          ),
          Markup.button.url(
            'ст.25.1 КоАП',
            'http://www.consultant.ru/cons/cgi/online.cgi?from=310131-11395&req=doc&rnd=C3C6E808E7EB69228BE01CF386778992&base=LAW&n=388938&stat=srcfld%3D134%26src%3D1000000001%26fld%3D134%26code%3D65535%26page%3Dinfo%26p%3D0%26base%3DLAW%26doc%3D310131#QsZmdgSiHgvwPNxj'
          ),
          Markup.button.url(
            'решение ВС РФ',
            'http://www.vsrf.ru/press_center/mass_media/26545/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu'),
        ],
        { columns: 2 }
      )
    )
})

bot.hears('Ваши права', (ctx) => {
  attachCommand('Ваши права'),
    ctx.replyWithHTML(
      rightsDriverScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'ст.51 Конституции',
            'http://www.consultant.ru/document/cons_doc_LAW_28399/83e04083255cc765ad2af577efd8db4607b207d5/'
          ),
          Markup.button.url(
            'п.51 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/66c419ccc3c1b8205260739743cce08ca7b92cb5/'
          ),
          Markup.button.url(
            'п.84,89,91 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/dbbfac1c0ef0ee0b778c4fd5075b18de5d4d3f27/'
          ),
          Markup.button.url(
            'п.132 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/4afe5bd7c3584f33c86a3799783ea9508560d0ea/'
          ),
          Markup.button.url(
            'ст.8 Закона о полиции',
            'http://www.consultant.ru/document/cons_doc_LAW_110165/a9c08e29adb629fb145160965279ad2efd397de7/'
          ),
          Markup.button.url(
            'решение ВС РФ',
            'http://www.vsrf.ru/press_center/mass_media/26545/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu'),
        ],
        { columns: 2 }
      )
    )
})

bot.hears('Алкоголь', (ctx) => {
  attachCommand('Алкоголь'),
    ctx.replyWithHTML(
      alcoholScene(),
      Markup.inlineKeyboard([
        Markup.button.url(
          'п.234 Адм.регламента',
          'http://www.consultant.ru/document/cons_doc_LAW_280037/4afe5bd7c3584f33c86a3799783ea9508560d0ea/'
        ),
        Markup.button.callback('<< Назад', 'MainMenu'),
      ])
    )
})

bot.hears('Нарушения инспектора', (ctx) => {
  attachCommand('Нарушения инспектора'),
    ctx.replyWithHTML(
      violationsScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'п.45,52 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/66c419ccc3c1b8205260739743cce08ca7b92cb5/'
          ),
          Markup.button.url(
            'ст.5 Закона О полиции',
            'http://www.consultant.ru/document/cons_doc_LAW_110165/50d6a5fc9ad995f3efca10bca062875531f1d30f/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu'),
        ],
        { columns: 2 }
      )
    )
})

bot.hears('Скорость', (ctx) => {
  attachCommand('Скорость'),
    ctx.replyWithHTML(
      speedScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu')])
    )
})

bot.hears('Протокол', (ctx) => {
  attachCommand('Протокол'),
    ctx.replyWithHTML(
      protocolScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'ст.28.1.1 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/777b1cbcecd072d6956dfe3563ec84636919491c/'
          ),
          Markup.button.url(
            'ст.28.2 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/86eb9da50d2bebf0f8320070bcc298ad5a93d41a/'
          ),
          Markup.button.url(
            'п.134,151,168,211 Адм.регламента',
            'http://www.consultant.ru/document/cons_doc_LAW_280037/4afe5bd7c3584f33c86a3799783ea9508560d0ea/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu'),
        ],

        { columns: 2 }
      )
    )
})

bot.hears('Ремень', (ctx) => {
  attachCommand('Ремень'),
    ctx.replyWithHTML(
      beltScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('Грязный знак', (ctx) => {
  attachCommand('Грязный знак'),
    ctx.replyWithHTML(
      dirtyScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('Техосмотр', (ctx) => {
  attachCommand('Техосмотр'),
    ctx.replyWithHTML(
      checkListScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('ОСАГО', (ctx) => {
  attachCommand('ОСАГО'),
    ctx.replyWithHTML(
      insuranceScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'ст.12.3.2 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/0486252c9b58867b61fbeadf42daad5e67b324f1/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu1'),
        ],

        { columns: 2 }
      )
    )
})

bot.hears('Взятка', (ctx) => {
  attachCommand('Взятка'),
    ctx.replyWithHTML(
      bribeScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('Осмотр', (ctx) => {
  attachCommand('Осмотр'),
    ctx.replyWithHTML(
      screeningScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('Досмотр', (ctx) => {
  attachCommand('Досмотр'),
    ctx.replyWithHTML(
      inspectionScene(),
      Markup.inlineKeyboard([Markup.button.callback('<< Назад', 'MainMenu1')])
    )
})

bot.hears('Обочина', (ctx) => {
  attachCommand('Обочина'),
    ctx.replyWithHTML(
      roadsideScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'п.1.2 ПДД',
            'http://www.consultant.ru/document/cons_doc_LAW_2709/5894b193fda5648afe1c1a5e70c028f25cd29099/'
          ),
          Markup.button.url(
            'п.9.9 ПДД',
            'http://www.consultant.ru/document/cons_doc_LAW_2709/d08dbb6ef3956314fd36b1d54a9393598f057acf/'
          ),
          Markup.button.url(
            'п.8.8 ПДД',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/73e48b1d556597db3d88d1648ea0486e7145b1de/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu1'),
        ],

        { columns: 2 }
      )
    )
})

bot.hears('Забыли документы', (ctx) => {
  attachCommand('Забыли документы'),
    ctx.replyWithHTML(
      rememberScene(),
      Markup.inlineKeyboard(
        [
          Markup.button.url(
            'ст.12.3 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/0486252c9b58867b61fbeadf42daad5e67b324f1/'
          ),
          Markup.button.url(
            'ст.12.7 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/86d85d3d522bb77876c524278464db710a481926/'
          ),
          Markup.button.url(
            'ст.27.13 КоАП',
            'http://www.consultant.ru/document/cons_doc_LAW_34661/73e48b1d556597db3d88d1648ea0486e7145b1de/'
          ),
          Markup.button.callback('<< Назад', 'MainMenu1'),
        ],

        { columns: 2 }
      )
    )
})

// Actions
bot.action('MainMenu', (ctx) => {
  ctx.reply(
    'Главное меню стр.1',
    Markup.inlineKeyboard([
      Markup.button.url(
        'ПДД',
        'http://www.consultant.ru/document/cons_doc_LAW_2709/824c911000b3626674abf3ad6e38a6f04b8a7428/'
      ),
      Markup.button.callback('На стр.2 >>', 'MainMenu1'),
    ])
  )
  ctx.replyWithHTML('выбирайте нужный пункт в меню', getMainMenu())
})
bot.action('MainMenu1', (ctx) => {
  ctx.reply(
    'Главное меню стр.2',
    Markup.inlineKeyboard(
      [
        Markup.button.callback('<< На стр.1', 'MainMenu'),
        Markup.button.url(
          'ПДД',
          'http://www.consultant.ru/document/cons_doc_LAW_2709/824c911000b3626674abf3ad6e38a6f04b8a7428/'
        ),
        Markup.button.url(
          '☕️ Кофе разработчику',
          'https://yoomoney.ru/to/41001424035652'
        ),
        // Markup.button.callback('На стр.3 >>', 'MainMenu2'),
      ],

      { columns: 2 }
    )
  )
  ctx.replyWithHTML('выбирайте нужный пункт в меню', getMainMenu1())
})
bot.action(localeActions, setLanguage)

// Errors
bot.catch(console.error)

bot.on('text', (ctx) => {
  ctx.reply('Просто открой меню и выбери нужный пункт')
})

// Start bot
bot.launch().then(() => {
  console.info(`Bot ${bot.botInfo.username} is up and running`)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
