import { WalletService } from '#/business/wallet/WalletService'
import type { WalletBalance, WalletHistory, WalletReservation, WalletTransaction } from '#/business/wallet/types'

export class WalletEngine {
  constructor(private readonly service = new WalletService()) {}

  balance(userId: string): WalletBalance {
    return this.service.getBalance(userId)
  }

  credit(userId: string, amount: number, note?: string): WalletTransaction {
    return this.service.credit(userId, amount, note)
  }

  debit(userId: string, amount: number, note?: string): WalletTransaction {
    return this.service.debit(userId, amount, note)
  }

  reserve(userId: string, amount: number, reason: string): WalletReservation {
    return this.service.reserve(userId, amount, reason)
  }

  release(userId: string, reservationId: string, reason?: string): WalletTransaction {
    return this.service.release(userId, reservationId, reason)
  }

  refund(userId: string, amount: number, note?: string): WalletTransaction {
    return this.service.refund(userId, amount, note)
  }

  expire(userId: string, amount: number, reason?: string): WalletTransaction {
    return this.service.expire(userId, amount, reason)
  }

  history(userId: string): WalletHistory {
    return this.service.history(userId)
  }
}
