import type { CreditEstimate, CreditEstimateInput, CreditReservation, CreditTransaction } from '#/business/credits/types'
import { CreditService } from '#/business/credits/CreditService'

export class CreditEngine {
  constructor(private readonly service = new CreditService()) {}

  estimate(input: CreditEstimateInput): CreditEstimate {
    return this.service.estimate(input)
  }

  reserve(userId: string, amount: number, reason: string, linkedRunId?: string): CreditReservation {
    return this.service.reserve(userId, amount, reason, linkedRunId)
  }

  consume(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    return this.service.consume(userId, amount, reason, linkedRunId)
  }

  release(userId: string, reservationId: string, reason?: string): CreditTransaction {
    return this.service.release(userId, reservationId, reason)
  }

  refund(userId: string, amount: number, reason: string, linkedRunId?: string): CreditTransaction {
    return this.service.refund(userId, amount, reason, linkedRunId)
  }

  history(userId: string): CreditTransaction[] {
    return this.service.history(userId)
  }
}
