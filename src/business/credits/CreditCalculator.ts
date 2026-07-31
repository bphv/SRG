import type { ICreditCalculator } from '#/business/credits/interfaces'
import type { CreditEstimate, CreditEstimateInput, CreditModelId, CreditModelPricing } from '#/business/credits/types'

const PRICING_TABLE: Record<CreditModelId, CreditModelPricing> = {
  GPT5: { model: 'GPT5', inputCostPer1kTokens: 0.02, outputCostPer1kTokens: 0.04, creditMultiplier: 1.25 },
  'GPT5-mini': { model: 'GPT5-mini', inputCostPer1kTokens: 0.006, outputCostPer1kTokens: 0.012, creditMultiplier: 0.65 },
  Vision: { model: 'Vision', inputCostPer1kTokens: 0.018, outputCostPer1kTokens: 0.024, creditMultiplier: 1.1 },
  Image: { model: 'Image', inputCostPer1kTokens: 0.03, outputCostPer1kTokens: 0.03, creditMultiplier: 1.6 },
  Audio: { model: 'Audio', inputCostPer1kTokens: 0.015, outputCostPer1kTokens: 0.02, creditMultiplier: 1.0 },
  Embedding: { model: 'Embedding', inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0, creditMultiplier: 0.3 },
  Streaming: { model: 'Streaming', inputCostPer1kTokens: 0.01, outputCostPer1kTokens: 0.018, creditMultiplier: 0.9 },
}

export class CreditCalculator implements ICreditCalculator {
  listPricings(): CreditModelPricing[] {
    return Object.values(PRICING_TABLE)
  }

  getPricing(model: CreditModelId): CreditModelPricing {
    return PRICING_TABLE[model]
  }

  estimate(input: CreditEstimateInput): CreditEstimate {
    const pricing = this.getPricing(input.model)
    const inputUnits = input.inputTokens / 1000
    const outputUnits = input.outputTokens / 1000
    const streamingPenalty = input.streaming ? 1.05 : 1

    const estimatedCost = Number(
      ((inputUnits * pricing.inputCostPer1kTokens + outputUnits * pricing.outputCostPer1kTokens) * streamingPenalty).toFixed(6),
    )
    const estimatedCredits = Number((estimatedCost * 100 * pricing.creditMultiplier).toFixed(2))

    return {
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      totalTokens: input.inputTokens + input.outputTokens,
      estimatedCost,
      estimatedCredits,
    }
  }
}
