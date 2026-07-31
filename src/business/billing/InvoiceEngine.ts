import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { IInvoiceEngine } from '#/business/billing/interfaces'
import type { InvoiceDraftInput, InvoiceLifecycle } from '#/business/billing/types'
import { CouponEngine } from '#/business/billing/CouponEngine'
import { TaxCalculator } from '#/business/billing/TaxCalculator'

export class InvoiceEngine implements IInvoiceEngine {
  constructor(
    private readonly taxCalculator = new TaxCalculator(),
    private readonly couponEngine = new CouponEngine(),
  ) {}

  create(input: InvoiceDraftInput): InvoiceLifecycle {
    const subtotal = Number(input.subtotal.toFixed(2))
    const coupon = input.couponCode ? this.couponEngine.apply(input.couponCode, subtotal) : null
    const discountedSubtotal = Number((subtotal - (coupon?.discountAmount ?? 0)).toFixed(2))
    const tax = this.taxCalculator.calculate(input.country ?? 'France', discountedSubtotal)
    const total = Number((discountedSubtotal + tax.taxAmount).toFixed(2))

    const invoice = BusinessFoundationService.createInvoice({
      userId: input.userId,
      amount: total,
      currency: input.currency ?? 'EUR',
      taxAmount: tax.taxAmount,
    })

    return {
      invoiceId: invoice.id,
      status: invoice.status === 'cancelled' ? 'cancelled' : invoice.status === 'paid' ? 'paid' : 'issued',
      amount: invoice.amount,
      currency: invoice.currency,
    }
  }
}
