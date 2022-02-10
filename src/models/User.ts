import { prop, getModelForClass, Ref } from '@typegoose/typegoose'
import { Receipt } from './Receipt'

export class User {
  @prop({ required: true, index: true, unique: true })
  id: number

  @prop()
  username: string

  @prop()
  name: string

  @prop({ ref: () => Receipt, index: true, unique: true })
  receipts: Ref<Receipt>[]

  @prop({ required: true, default: 'en' })
  language: string

  @prop({ required: false, default: new Date() })
  lastActivity: Date
}

// Get User model
export const UserModel = getModelForClass(User, {
  schemaOptions: { timestamps: true },
})

// Get or create user
export async function findUser(id: number) {
  let user = await UserModel.findOne({ id })
  if (!user) {
    try {
      user = await new UserModel({ id }).save()
    } catch (err) {
      user = await UserModel.findOne({ id })
    }
  }

  const filter = { id: id }
  const update = { lastActivity: new Date() }
  user = await UserModel.findOneAndUpdate(filter, update)
  return user
}

// Get all users
export async function findAllUsers() {
  // Empty `filter` means "match all documents"
  const filter = {}
  const all = await UserModel.find(filter)
  return all
}

// Get array receipts of user
export async function findReceiptsUser(id: number) {
  const user = await UserModel.findOne({ id })
  return user.receipts
}
