import type { WalletBalance, WalletHistory, WalletReservation, WalletTransaction, WalletValidationResult } from '#/business/wallet/types'

export interface IWalletValidator {
  validateAmount: (amount: number) => WalletValidationResult
  validateDebit: (balance: WalletBalance, amount: number) => WalletValidationResult
}

export interface IWalletService {
  getBalance: (userId: string) => WalletBalance
  credit: (userId: string, amount: number, note?: string) => WalletTransaction
  debit: (userId: string, amount: number, note?: string) => WalletTransaction
  reserve: (userId: string, amount: number, reason: string) => WalletReservation
  release: (userId: string, reservationId: string, reason?: string) => WalletTransaction
  refund: (userId: string, amount: number, note?: string) => WalletTransaction
  expire: (userId: string, amount: number, reason?: string) => WalletTransaction
  history: (userId: string) => WalletHistory
}
