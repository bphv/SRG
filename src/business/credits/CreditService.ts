import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { ICreditService } from '#/business/credits/interfaces'
import type { CreditEstimate, CreditEstimateInput, CreditReservation, CreditTransaction } from '#/business/credits/types'
import { CreditCalculator } from '#/business/credits/CreditCalculator'
import { CreditValidator } from '#/business/credits/CreditValidator'

export class CreditService implements ICreditService {
  private readonly reservations = new Map<string, CreditReservation[]>()

  constructor(
    private readonly calculator = new CreditCalculator(),
    private readonly validator = new CreditValidator(),
  ) {}

  reserve(userId: string, amount: number, reason: string, linkedRunId?: string): CreditReservation {
    this.assertAmount(amount)
    const tx = BusinessFoundationService.reserveCredit(userId, amount, reason, linkedRunId)
    const reservation: CreditReservation = {
      id: tx.id,
      userId,
      amount,
      reason,
      linkedRunId,
      createdAt: tx.createdAt,
      status: 'active',
    }

    const existing = this.reservations.get(userId) ?? []
    this.reservations.set(userId, [reservation, ...existing])
    return reservation
  }

  consume(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    this.assertAmount(amount)
    const tx = BusinessFoundationService.consumeReservedCredit(userId, amount, reason, linkedRunId)

    const reservations = this.reservations.get(userId) ?? []
    const reservation = reservations.find((item) => item.status === 'active' && item.amount >= amount)
    if (reservation) {
      reservation.status = 'consumed'
    }

    return {
      id: tx.id,
      userId,
      type: 'consume',
      amount,
      reason,
      linkedRunId,
      at: tx.createdAt,
      reservationId: reservation?.id,
    }
  }

  release(userId: string, reservationId: string, reason = 'credit release'): CreditTransaction {
    const reservations = this.reservations.get(userId) ?? []
    const reservation = reservations.find((item) => item.id === reservationId)
    if (!reservation) {
      throw new Error('Credit reservation not found.')
    }
    if (reservation.status !== 'active') {
      throw new Error('Credit reservation is not active.')
    }

    reservation.status = 'released'
    const tx = BusinessFoundationService.refundCredit(userId, reservation.amount, reason, reservation.linkedRunId)

    return {
      id: tx.id,
      userId,
      type: 'release',
      amount: reservation.amount,
      reason,
      linkedRunId: reservation.linkedRunId,
      at: tx.createdAt,
      reservationId,
    }
  }

  refund(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    this.assertAmount(amount)
    const tx = BusinessFoundationService.refundCredit(userId, amount, reason, linkedRunId)

    return {
      id: tx.id,
      userId,
      type: 'refund',
      amount,
      reason,
      linkedRunId,
      at: tx.createdAt,
    }
  }

  estimate(input: CreditEstimateInput): CreditEstimate {
    const modelValidation = this.validator.validateModel(input.model)
    if (!modelValidation.valid) {
      throw new Error(modelValidation.errors.join(' '))
    }
    return this.calculator.estimate(input)
  }

  history(userId: string): CreditTransaction[] {
    const snapshot = BusinessFoundationService.getSnapshot()
    return snapshot.creditTransactions
      .filter((item) => item.userId === userId)
      .map((item) => ({
        id: item.id,
        userId,
        type: item.type === 'reservation' ? 'reserve' : item.type === 'consumption' ? 'consume' : 'refund',
        amount: item.amount,
        reason: item.reason,
        linkedRunId: item.linkedRunId,
        at: item.createdAt,
      }))
  }

  private assertAmount(amount: number): void {
    const amountValidation = this.validator.validateAmount(amount)
    if (!amountValidation.valid) {
      throw new Error(amountValidation.errors.join(' '))
    }
  }
}
