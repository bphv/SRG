import type {
  CreditEstimate,
  CreditEstimateInput,
  CreditModelId,
  CreditModelPricing,
  CreditReservation,
  CreditTransaction,
  CreditValidationResult,
} from '#/business/credits/types'

export interface ICreditCalculator {
  listPricings: () => CreditModelPricing[]
  getPricing: (model: CreditModelId) => CreditModelPricing
  estimate: (input: CreditEstimateInput) => CreditEstimate
}

export interface ICreditValidator {
  validateAmount: (amount: number) => CreditValidationResult
  validateModel: (model: CreditModelId) => CreditValidationResult
}

export interface ICreditService {
  reserve: (userId: string, amount: number, reason: string, linkedRunId?: string) => CreditReservation
  consume: (userId: string, amount: number, reason: string, linkedRunId?: string) => CreditTransaction
  release: (userId: string, reservationId: string, reason?: string) => CreditTransaction
  refund: (userId: string, amount: number, reason: string, linkedRunId?: string) => CreditTransaction
  estimate: (input: CreditEstimateInput) => CreditEstimate
  history: (userId: string) => CreditTransaction[]
}
