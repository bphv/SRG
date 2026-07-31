import type { ICreditValidator } from '#/business/credits/interfaces'
import type { CreditModelId, CreditValidationResult } from '#/business/credits/types'

const MODELS: CreditModelId[] = ['GPT5', 'GPT5-mini', 'Vision', 'Image', 'Audio', 'Embedding', 'Streaming']

export class CreditValidator implements ICreditValidator {
  validateAmount(amount: number): CreditValidationResult {
    const errors: string[] = []
    if (!Number.isFinite(amount)) {
      errors.push('Amount must be a finite number.')
    }
    if (amount <= 0) {
      errors.push('Amount must be greater than zero.')
    }
    return { valid: errors.length === 0, errors }
  }

  validateModel(model: CreditModelId): CreditValidationResult {
    if (!MODELS.includes(model)) {
      return { valid: false, errors: ['Unsupported model.'] }
    }
    return { valid: true, errors: [] }
  }
}
