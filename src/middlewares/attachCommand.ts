import { upCommandCounter } from '@/models/Command'

export async function attachCommand(command_name: string) {
  upCommandCounter(command_name)
  return command_name
}
