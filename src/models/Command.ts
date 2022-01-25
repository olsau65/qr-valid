import { prop, getModelForClass } from '@typegoose/typegoose'

export class Command {
  @prop({ required: true, index: true, unique: true, sparse: true })
  command_name: string

  @prop({ required: false, default: 0 })
  counter: number
}

// Get Command model
const CommandModel = getModelForClass(Command, {
  schemaOptions: { timestamps: true },
})

// Update command counter
export async function upCommandCounter(com_name: string) {
  // console.log(com_name)
  let new_command = await CommandModel.findOne({ command_name: com_name })

  if (new_command == null) {
    try {
      new_command = await new CommandModel({ command_name: com_name }).save()
    } catch (err) {
      new_command = await CommandModel.findOne({ command_name: com_name })
    }
  }

  const filter = { command_name: com_name }
  const update = { counter: new_command.counter + 1 }
  return await CommandModel.findOneAndUpdate(filter, update)
}

// Get all commands
export async function findAllCommands() {
  // Empty `filter` means "match all documents"
  const filter = {}
  const all_commands = await CommandModel.find(filter)
  return all_commands
}
