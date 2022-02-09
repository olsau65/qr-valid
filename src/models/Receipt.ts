import { prop, getModelForClass } from '@typegoose/typegoose'
import { UserModel } from '.'

export class Receipt {
  @prop({ required: true, index: true, unique: true, sparse: true })
  fsid: number

  @prop()
  seller: string

  @prop()
  inn: string

  @prop()
  date: string

  @prop()
  sum: number
}

// Get Command model
export const ReceiptModel = getModelForClass(Receipt, {
  schemaOptions: { timestamps: true },
})

// Get or create receipt
export async function findReceipt(tmp_check, id_user) {
  let fsid = tmp_check['id']
  const update = {
    fsid: tmp_check['id'],
    seller: tmp_check['seller'],
    inn: tmp_check['inn'],
    date: tmp_check['date'],
    sum: tmp_check['sum'],
  }

  let new_receipt = await ReceiptModel.findOne({ fsid })

  if (new_receipt == null) {
    // Try/catch is used to avoid race conditions
    try {
      new_receipt = await new ReceiptModel(update).save()
      console.log('Создаем новый чек')
      console.log(new_receipt)
    } catch (err) {
      console.log(err)
      new_receipt = await ReceiptModel.findOne({ fsid })
      console.log('Находим чек')
      console.log(new_receipt)
    }
  }

  let filter = { fsid: fsid }

  new_receipt = await ReceiptModel.findOneAndUpdate(filter, update)
  console.log('Записываем чек')
  console.log(new_receipt)

  //const update_user = UserModel.findOneAndUpdate({ id: id_user }, update)
  let user = await UserModel.findOne({ id: id_user })
  console.log(user)
  if (!user.receipts.includes(new_receipt._id)) {
    user.receipts.push(new_receipt)
    user.save()
    console.log('Обновляем список чеков у пользователя')
  }

  return new_receipt
}

// Find user's receipt
export async function findUserReceipt(id_receipt) {
  const _id = id_receipt
  let receipt = await ReceiptModel.findOne({ _id })
  // console.log(_id)
  // console.log(receipt)

  return receipt
}

// Get all receipts
export async function findAllReceipts() {
  // Empty filter means "match all documents"
  const filter = {}
  const all = await ReceiptModel.find(filter)
  return all
}
