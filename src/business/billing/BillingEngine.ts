import type { SubscriptionPlanName } from '#/app/services/business/BusinessFoundationService'
import type {
  InvoiceDraftInput,
  InvoiceLifecycle,
  PaymentMethod,
  PaymentProvider,
  PaymentResult,
  PaymentSession,
  SubscriptionLifecycleResult,
} from '#/business/billing/types'
import { CouponEngine } from '#/business/billing/CouponEngine'
import { InvoiceEngine } from '#/business/billing/InvoiceEngine'
import { PaymentEngine } from '#/business/billing/PaymentEngine'
import { SubscriptionEngine } from '#/business/billing/SubscriptionEngine'
import { TaxCalculator } from '#/business/billing/TaxCalculator'

export class BillingEngine {
  readonly invoices: InvoiceEngine
  readonly subscriptions: SubscriptionEngine
  readonly payments: PaymentEngine
  readonly taxes: TaxCalculator
  readonly coupons: CouponEngine

  constructor() {
    this.taxes = new TaxCalculator()
    this.coupons = new CouponEngine()
    this.invoices = new InvoiceEngine(this.taxes, this.coupons)
    this.subscriptions = new SubscriptionEngine()
    this.payments = new PaymentEngine()
  }

  createInvoice(input: InvoiceDraftInput): InvoiceLifecycle {
    return this.invoices.create(input)
  }

  subscribe(userId: string, planName: SubscriptionPlanName): SubscriptionLifecycleResult {
    return this.subscriptions.subscribe(userId, planName)
  }

  renew(userId: string): SubscriptionLifecycleResult {
    return this.subscriptions.renew(userId)
  }

  cancel(userId: string): SubscriptionLifecycleResult {
    return this.subscriptions.cancel(userId)
  }

  upgrade(userId: string, targetPlan: SubscriptionPlanName): SubscriptionLifecycleResult {
    return this.subscriptions.upgrade(userId, targetPlan)
  }

  downgrade(userId: string, targetPlan: SubscriptionPlanName): SubscriptionLifecycleResult {
    return this.subscriptions.downgrade(userId, targetPlan)
  }

  providers(): PaymentProvider[] {
    return this.payments.providers()
  }

  registerPaymentMethod(input: Omit<PaymentMethod, 'id'>): PaymentMethod {
    return this.payments.registerMethod(input)
  }

  createPaymentSession(input: {
    provider: PaymentProvider['name']
    invoiceId: string
    userId: string
    amount: number
    currency: string
  }): PaymentSession {
    return this.payments.createSession(input)
  }

  payInvoice(sessionId: string, methodId: string): PaymentResult {
    return this.payments.payInvoice(sessionId, methodId)
  }
}
