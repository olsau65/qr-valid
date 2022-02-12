import { findReceipt } from '@/models/Receipt'

export async function attachReceipt(tmp_check, id_user) {
  findReceipt(tmp_check, id_user)
  // return tmp_check
}
