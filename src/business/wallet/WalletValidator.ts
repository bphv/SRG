import type { IWalletValidator } from '#/business/wallet/interfaces'
import type { WalletBalance, WalletValidationResult } from '#/business/wallet/types'

export class WalletValidator implements IWalletValidator {
  validateAmount(amount: number): WalletValidationResult {
    const errors: string[] = []
    if (!Number.isFinite(amount)) {
      errors.push('Amount must be a finite number.')
    }
    if (amount <= 0) {
      errors.push('Amount must be greater than zero.')
    }
    return { valid: errors.length === 0, errors }
  }

  validateDebit(balance: WalletBalance, amount: number): WalletValidationResult {
    const baseValidation = this.validateAmount(amount)
    if (!baseValidation.valid) {
      return baseValidation
    }

    if (balance.available < amount) {
      return {
        valid: false,
        errors: ['Insufficient wallet balance.'],
      }
    }

    return { valid: true, errors: [] }
  }
}
