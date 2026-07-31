export type WalletOperation = 'credit' | 'debit' | 'reserve' | 'release' | 'refund' | 'expire'

export type WalletBalance = {
  userId: string
  available: number
  reserved: number
  bonus: number
  total: number
  updatedAt: string
}

export type WalletTransaction = {
  id: string
  userId: string
  type: WalletOperation
  amount: number
  note: string
  at: string
  referenceId?: string
}

export type WalletReservation = {
  id: string
  userId: string
  amount: number
  reason: string
  createdAt: string
  releasedAt?: string
  expiredAt?: string
}

export type WalletHistory = {
  userId: string
  transactions: WalletTransaction[]
}

export type WalletValidationResult = {
  valid: boolean
  errors: string[]
}
