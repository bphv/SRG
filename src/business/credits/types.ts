export type CreditModelId =
  | 'GPT5'
  | 'GPT5-mini'
  | 'Vision'
  | 'Image'
  | 'Audio'
  | 'Embedding'
  | 'Streaming'

export type CreditModelPricing = {
  model: CreditModelId
  inputCostPer1kTokens: number
  outputCostPer1kTokens: number
  creditMultiplier: number
}

export type CreditEstimateInput = {
  model: CreditModelId
  inputTokens: number
  outputTokens: number
  streaming?: boolean
}

export type CreditEstimate = {
  model: CreditModelId
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number
  estimatedCredits: number
}

export type CreditReservation = {
  id: string
  userId: string
  amount: number
  reason: string
  linkedRunId?: string
  createdAt: string
  status: 'active' | 'released' | 'consumed' | 'refunded'
}

export type CreditTransactionType = 'reserve' | 'consume' | 'release' | 'refund'

export type CreditTransaction = {
  id: string
  userId: string
  type: CreditTransactionType
  amount: number
  reason: string
  linkedRunId?: string
  at: string
  reservationId?: string
}

export type CreditValidationResult = {
  valid: boolean
  errors: string[]
}
