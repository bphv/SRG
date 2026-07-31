import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { ITaxCalculator } from '#/business/billing/interfaces'
import type { TaxCalculation } from '#/business/billing/types'

export class TaxCalculator implements ITaxCalculator {
  calculate(country: string, subtotal: number): TaxCalculation {
    const snapshot = BusinessFoundationService.getSnapshot()
    const tax = snapshot.taxes.find((item) => item.country.toLowerCase() === country.toLowerCase())
    const ratePercent = tax?.ratePercent ?? 0
    const taxAmount = Number((subtotal * (ratePercent / 100)).toFixed(2))

    return {
      country,
      ratePercent,
      taxAmount,
    }
  }
}
