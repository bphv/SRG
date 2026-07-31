import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { IWalletService } from '#/business/wallet/interfaces'
import type { WalletBalance, WalletHistory, WalletReservation, WalletTransaction } from '#/business/wallet/types'
import { WalletValidator } from '#/business/wallet/WalletValidator'

function localId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export class WalletService implements IWalletService {
  private readonly validator = new WalletValidator()
  private readonly reservationsByUser = new Map<string, WalletReservation[]>()
  private readonly localTransactionsByUser = new Map<string, WalletTransaction[]>()

  getBalance(userId: string): WalletBalance {
    const snapshot = BusinessFoundationService.getSnapshot()
    const wallet = snapshot.wallets.find((item) => item.userId === userId)
    const reservations = this.reservationsByUser.get(userId) ?? []
    const reserved = reservations
      .filter((item) => !item.releasedAt && !item.expiredAt)
      .reduce((sum, item) => sum + item.amount, 0)

    const available = Number(((wallet?.balance ?? 0) - reserved).toFixed(2))
    const bonus = Number((wallet?.bonusBalance ?? 0).toFixed(2))
    const total = Number((available + bonus).toFixed(2))

    return {
      userId,
      available,
      reserved: Number(reserved.toFixed(2)),
      bonus,
      total,
      updatedAt: wallet?.updatedAt ?? new Date().toISOString(),
    }
  }

  credit(userId: string, amount: number, note = 'Wallet credit'): WalletTransaction {
    this.assertAmount(amount)
    const transaction = BusinessFoundationService.rechargeWallet(userId, amount, note)
    return this.mapFoundationTransaction(transaction.id, userId, 'credit', amount, note, transaction.createdAt)
  }

  debit(userId: string, amount: number, note = 'Wallet debit'): WalletTransaction {
    const balance = this.getBalance(userId)
    const validation = this.validator.validateDebit(balance, amount)
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '))
    }

    const transaction = BusinessFoundationService.rechargeWallet(userId, -amount, note)
    return this.mapFoundationTransaction(transaction.id, userId, 'debit', amount, note, transaction.createdAt)
  }

  reserve(userId: string, amount: number, reason: string): WalletReservation {
    const balance = this.getBalance(userId)
    const validation = this.validator.validateDebit(balance, amount)
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '))
    }

    const reservation: WalletReservation = {
      id: localId('wres'),
      userId,
      amount: Number(amount.toFixed(2)),
      reason,
      createdAt: new Date().toISOString(),
    }

    const existing = this.reservationsByUser.get(userId) ?? []
    this.reservationsByUser.set(userId, [reservation, ...existing])
    this.appendLocalTransaction(userId, {
      id: localId('wtx'),
      userId,
      type: 'reserve',
      amount: reservation.amount,
      note: reason,
      referenceId: reservation.id,
      at: reservation.createdAt,
    })

    return reservation
  }

  release(userId: string, reservationId: string, reason = 'Wallet release'): WalletTransaction {
    const reservations = this.reservationsByUser.get(userId) ?? []
    const reservation = reservations.find((item) => item.id === reservationId)
    if (!reservation) {
      throw new Error('Wallet reservation not found.')
    }
    if (reservation.releasedAt || reservation.expiredAt) {
      throw new Error('Wallet reservation already closed.')
    }

    reservation.releasedAt = new Date().toISOString()
    const transaction: WalletTransaction = {
      id: localId('wtx'),
      userId,
      type: 'release',
      amount: reservation.amount,
      note: reason,
      referenceId: reservation.id,
      at: reservation.releasedAt,
    }
    this.appendLocalTransaction(userId, transaction)
    return transaction
  }

  refund(userId: string, amount: number, note = 'Wallet refund'): WalletTransaction {
    this.assertAmount(amount)
    const transaction = BusinessFoundationService.rechargeWallet(userId, amount, note)
    return this.mapFoundationTransaction(transaction.id, userId, 'refund', amount, note, transaction.createdAt)
  }

  expire(userId: string, amount: number, reason = 'Wallet expiration'): WalletTransaction {
    const balance = this.getBalance(userId)
    const validation = this.validator.validateDebit(balance, amount)
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '))
    }

    const transaction = BusinessFoundationService.rechargeWallet(userId, -amount, reason)
    return this.mapFoundationTransaction(transaction.id, userId, 'expire', amount, reason, transaction.createdAt)
  }

  history(userId: string): WalletHistory {
    const snapshot = BusinessFoundationService.getSnapshot()
    const foundationTransactions = snapshot.walletTransactions
      .filter((item) => item.userId === userId)
      .map<WalletTransaction>((item) => {
        const mappedType = item.amount < 0 ? 'debit' : item.type === 'refund' ? 'refund' : 'credit'
        return {
          id: item.id,
          userId,
          type: mappedType,
          amount: Number(Math.abs(item.amount).toFixed(2)),
          note: item.note,
          at: item.createdAt,
        }
      })

    const localTransactions = this.localTransactionsByUser.get(userId) ?? []

    return {
      userId,
      transactions: [...localTransactions, ...foundationTransactions].sort((a, b) =>
        a.at < b.at ? 1 : a.at > b.at ? -1 : 0,
      ),
    }
  }

  private assertAmount(amount: number): void {
    const validation = this.validator.validateAmount(amount)
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '))
    }
  }

  private appendLocalTransaction(userId: string, transaction: WalletTransaction): void {
    const existing = this.localTransactionsByUser.get(userId) ?? []
    this.localTransactionsByUser.set(userId, [transaction, ...existing])
  }

  private mapFoundationTransaction(
    id: string,
    userId: string,
    type: WalletTransaction['type'],
    amount: number,
    note: string,
    at: string,
  ): WalletTransaction {
    const normalizedAmount = Number(Math.abs(amount).toFixed(2))
    return {
      id,
      userId,
      type,
      amount: normalizedAmount,
      note,
      at,
    }
  }
}
