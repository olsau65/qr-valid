import fetch from 'node-fetch'
import * as fs from 'fs'
import * as ExcelJS from 'exceljs'
import { Context, Markup } from 'telegraf'
import { localeActions } from './handlers/language'
// Setup @/ aliases for modules
import 'module-alias/register'
// Config dotenv
import * as dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/../.env` })
// import { UserModel } from '@/models/User'
// import { ReceiptModel } from '@/models/Receipt'
import { bot } from '@/helpers/bot'
import { findAllUsers, findReceiptsUser } from '@/models/User'
import { findAllReceipts, findUserReceipt } from '@/models/Receipt'
import { ignoreOldMessageUpdates } from '@/middlewares/ignoreOldMessageUpdates'
import { sendHelp } from '@/handlers/sendHelp'
import { sendAll } from '@/handlers/sendAll'
import { i18n, attachI18N } from '@/helpers/i18n'
import { setLanguage, sendLanguage } from '@/handlers/language'
import { getMainMenu } from '@/handlers/mainMenu'
import { attachUser } from '@/middlewares/attachUser'
import { attachReceipt } from '@/middlewares/attachReceipts'

class NalogRu {
  HOST = 'irkkt-mobile.nalog.ru:8888'
  DEVICE_OS = 'iOS'
  CLIENT_VERSION = '2.9.0'
  DEVICE_ID = process.env.DEVICEID
  ACCEPT = '*/*'
  USER_AGENT = 'billchecker/2.9.0 (iPhone; iOS 13.6; Scale/2.00)'
  ACCEPT_LANGUAGE = 'ru-RU;q=1, en-US;q=0.9'
  CLIENT_SECRET = process.env.CLIENTSECRET
  OS = 'Android'

  session_id: string
  refresh_token: string
  phone: string

  async set_session_id(this, phone: string) {
    this.phone = phone

    let url = `https://${this.HOST}/v2/auth/phone/request`
    let payload = {
      phone: this.phone,
      client_secret: this.CLIENT_SECRET,
      os: this.OS,
    }

    let headers = {
      Host: this.HOST,
      Accept: this.ACCEPT,
      'Device-OS': this.DEVICE_OS,
      'Device-Id': this.DEVICE_ID,
      clientVersion: this.CLIENT_VERSION,
      'Accept-Language': this.ACCEPT_LANGUAGE,
      'User-Agent': this.USER_AGENT,
      'Content-Type': 'application/json; charset=utf-8',
    }

    let response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })
  }

  async answer_sms(this, smscode: string) {
    this.smscode = smscode

    let url = `https://${this.HOST}/v2/auth/phone/verify`
    let payload = {
      phone: this.phone,
      client_secret: this.CLIENT_SECRET,
      code: this.smscode,
      os: this.OS,
    }

    let headers = {
      Host: this.HOST,
      Accept: this.ACCEPT,
      'Device-OS': this.DEVICE_OS,
      'Device-Id': this.DEVICE_ID,
      clientVersion: this.CLIENT_VERSION,
      'Accept-Language': this.ACCEPT_LANGUAGE,
      'User-Agent': this.USER_AGENT,
      'Content-Type': 'application/json; charset=utf-8',
    }

    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: headers,
    })

    let data = await response.json()

    this.session_id = data['sessionId']
    this.refresh_token = data['refresh_token']
  }

  async refresh_token_function(this) {
    let url = `https://${this.HOST}/v2/mobile/users/refresh`
    let payload = {
      refresh_token: this.refresh_token,
      client_secret: this.CLIENT_SECRET,
    }

    let headers = {
      Host: this.HOST,
      Accept: this.ACCEPT,
      'Device-OS': this.DEVICE_OS,
      'Device-Id': this.DEVICE_ID,
      clientVersion: this.CLIENT_VERSION,
      'Accept-Language': this.ACCEPT_LANGUAGE,
      'User-Agent': this.USER_AGENT,
      'Content-Type': 'application/json; charset=utf-8',
    }

    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: headers,
    })

    let data = await response.json()
    // console.log(JSON.stringify(data))
    this.session_id = data['sessionId']
    this.refresh_token = data['refresh_token']
  }

  async get_ticket_id(qr: string) {
    let url = `https://${this.HOST}/v2/ticket`
    let payload = { qr: qr }
    let headers = {
      Host: this.HOST,
      Accept: this.ACCEPT,
      'Device-OS': this.DEVICE_OS,
      'Device-Id': this.DEVICE_ID,
      clientVersion: this.CLIENT_VERSION,
      'Accept-Language': this.ACCEPT_LANGUAGE,
      sessionId: this.session_id,
      'User-Agent': this.USER_AGENT,
      'Content-Type': 'application/json; charset=utf-8',
    }

    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: headers,
    })

    let data = await response.json()
    // console.log(`ticket id = ${data['id']}`)
    return data['id']
  }

  async get_ticket(qr: string) {
    let ticket_id = await this.get_ticket_id(qr)
    let url = `https://${this.HOST}/v2/tickets/${ticket_id}`
    let headers = {
      Host: this.HOST,
      sessionId: this.session_id,
      'Device-OS': this.DEVICE_OS,
      clientVersion: this.CLIENT_VERSION,
      'Device-Id': this.DEVICE_ID,
      Accept: this.ACCEPT,
      'User-Agent': this.USER_AGENT,
      'Accept-Language': this.ACCEPT_LANGUAGE,
      'Content-Type': 'application/json; charset=utf-8',
    }

    let response = await fetch(url, {
      headers: headers,
    })

    let data = await response.json()
    return data
  }
}

const client = new NalogRu()
let stage = 0
let tmp_check = {
  id: 0,
  seller: '',
  inn: '',
  date: '',
  sum: 0,
  counter: 0,
}

// Middlewares
bot.use(ignoreOldMessageUpdates)
bot.use(attachUser)
bot.use(i18n.middleware(), attachI18N)

// Commands
bot.start((ctx) => {
  stage = 0
  ctx.replyWithHTML(
    'Привет! Я бот, который проверит кассовый чек в сервисе ФНС и пришлет тебе результат.\n\n' +
      '1. Введи номер телефона, на который сервис ФНС пришлет SMS-код для авторизации.\n\n' +
      '2. Сканируй QR-код с кассового чека подходящим приложением на смартфоне.\n\n' +
      '3. Полученную после сканирования текстовую строку скопируй из приложения и вставь сюда.\n\n' +
      '4. Отправь эту строку мне и получишь результат проверки.\n\n' +
      '5. Чеки можно сохранить в файл Excel и скачать его для аналитики.',
    getMainMenu()
  )
  ctx.replyWithHTML('Введите номер телефона в формате +70000000000')
})
bot.command('help', sendHelp)
bot.command('language', sendLanguage)
bot.command(process.env.MSG, sendAll)

bot.command('stats', async (ctx) => {
  const all_users = await findAllUsers()
  const all_receipts = await findAllReceipts()
  ctx.replyWithHTML(
    '------------\n' +
      'Amount of users: ' +
      String(all_users.length) +
      '\n' +
      'Amount of receipts: ' +
      String(all_receipts.length) +
      '\n' +
      '------------'
  )
})

bot.hears('Авторизация', (ctx) => {
  stage = 0
  ctx.replyWithHTML(
    'Новый сеанс связи с сервисом ФНС для проверки чеков:\n\n' +
      '1. Введите номер телефона, на который сервис ФНС пришлет SMS-код для авторизации.\n\n' +
      '2. Сканируйте QR-код с кассового чека подходящим приложением на смартфоне.\n\n' +
      '3. Полученную после сканирования текстовую строку скопируйте из приложения и вставьте сюда.\n\n' +
      '4. Отправьте эту строку мне и получите результат проверки.'
  )
  ctx.replyWithHTML('Введите номер телефона в формате +70000000000')
})

bot.hears('Мои чеки', async (ctx) => {
  const workbook = new ExcelJS.Workbook()
  // ctx.replyWithHTML('Создали книгу')
  const worksheet = workbook.addWorksheet('Мои чеки')

  worksheet.columns = [
    { header: 'Номер чека', key: 'fsid', width: 20 },
    { header: 'Продавец', key: 'seller', width: 40 },
    { header: 'ИНН', key: 'inn', width: 20 },
    { header: 'Дата', key: 'date', width: 20 },
    { header: 'Сумма', key: 'sum', width: 20 },
  ]

  const dir_path = 'tmp/'
  try {
    fs.mkdirSync(dir_path, { recursive: true })
    console.log('Done')
  } catch (e) {
    console.log(e)
  }

  const file_path = dir_path + ctx.dbuser.id + '.xlsx'

  let record = {}
  const arr = await findReceiptsUser(ctx.dbuser.id)
  ctx.replyWithHTML('Получили массив чеков пользователя')
  if (!arr) {
    ctx.replyWithHTML('Нет сохраненных чеков')
  } else {
    var key

    for (key of arr) {
      // console.log(key)
      let new_receipt = await findUserReceipt(key)
      if (!new_receipt) {
        // console.log('Чек не найден в БД')
        ctx.replyWithHTML('Чек не найден в БД')
      } else {
        record = {
          fsid: String(new_receipt.fsid),
          seller: new_receipt.seller,
          inn: new_receipt.inn,
          date: new_receipt.date,
          sum: new_receipt.sum,
        }
        // console.log('Пишем строку в файл XLSX')
        // ctx.replyWithHTML('Пишем строку в файл XLSX')
        worksheet.addRow(record)
      }
    }

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
    })

    await workbook.xlsx
      .writeFile(file_path)
      .then(() => {
        // console.log('Сохраняем файл XLSX')
        ctx.replyWithHTML('Отдаем файл')
        ctx.replyWithDocument({ source: file_path })

        // try {
        //   fs.unlinkSync(file_path)
        //   console.log('Deleted')
        // } catch (e) {
        //   console.log(e)
        // }
      })
      .catch((err) => {
        console.log('err', err)
        ctx.replyWithHTML(err)
      })
  }
})

bot.hears('Проверка чека', async (ctx) => {
  stage = 2
  await client
    .refresh_token_function()
    .then((value) =>
      ctx.replyWithHTML('Вставьте строку - результат сканирования QR-кода')
    )
    .catch((err) =>
      ctx.replyWithHTML(
        "Сеанс с ФНС истек. Нажмите в меню кнопку 'Авторизация'"
      )
    )
})

// Actions
bot.action('SaveQR', (ctx) => {
  attachReceipt(tmp_check, ctx.dbuser.id)
  ctx.reply(
    'Сохраняем чек',
    Markup.inlineKeyboard([
      [Markup.button.callback('Проверить еще QR-код', 'AnotherQR')],
    ])
  )
})

bot.action('AnotherQR', async (ctx) => {
  stage = 2
  await client
    .refresh_token_function()
    .then((value) =>
      ctx.replyWithHTML('Вставьте строку - результат сканирования QR-кода')
    )
    .catch((err) =>
      ctx.replyWithHTML(
        "Сеанс с ФНС истек. Нажмите в меню кнопку 'Авторизация'"
      )
    )
})

bot.action(localeActions, setLanguage)

// Errors
bot.catch(console.error)

bot.on('text', async (ctx) => {
  let mess = ctx.message.text

  if (stage == 0) {
    if (mess.slice(0, 2) == '+7') {
      client.set_session_id(mess)
      stage = 1
      ctx.replyWithHTML('Введите код из SMS')
    } else {
      ctx.replyWithHTML(
        'Неправильный номер. Введите номер в формате +70000000000'
      )
    }
  } else if (stage == 1) {
    client.answer_sms(mess)
    stage = 2
    ctx.replyWithHTML('Вставьте строку - результат сканирования QR-кода')
  } else if (stage == 2) {
    if (mess.slice(0, 2) == 't=') {
      ctx.replyWithHTML('Отправляю QR-код в ФНС')
      let resp = await client.get_ticket(mess)
      let sum = resp['operation']['sum'] / 100
      tmp_check['id'] = resp['query']['fsId']
      tmp_check['seller'] = resp['seller']['name']
      tmp_check['inn'] = resp['seller']['inn']
      tmp_check['date'] = resp['operation']['date']
      tmp_check['sum'] = sum

      ctx.replyWithHTML(
        // `${JSON.stringify(resp, null, 2)}`,
        '-----------------\n' +
          'Кассовый чек\n' +
          `Продавец: ${resp['seller']['name']}\n` +
          `ИНН: ${resp['seller']['inn']}\n` +
          `Сумма: ${sum}\n` +
          `Дата и время: ${resp['operation']['date']}\n` +
          '-----------------\n',
        Markup.inlineKeyboard([
          [Markup.button.callback('Сохранить в файл', 'SaveQR')],
          [Markup.button.callback('Проверить еще QR-код', 'AnotherQR')],
        ])
      )
    } else {
      ctx.replyWithHTML('Неправильный формат QR-кода')
    }
  }
})

// Start bot
bot.launch().then(() => {
  console.info(`Bot ${bot.botInfo.username} is up and running`)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
