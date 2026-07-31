import type {
  CouponApplication,
  InvoiceDraftInput,
  InvoiceLifecycle,
  PaymentMethod,
  PaymentProvider,
  PaymentResult,
  PaymentSession,
  SubscriptionLifecycleResult,
  TaxCalculation,
} from '#/business/billing/types'
import type { SubscriptionPlanName } from '#/app/services/business/BusinessFoundationService'

export interface PaymentGateway {
  createSession: (input: {
    provider: PaymentProvider['name']
    invoiceId: string
    userId: string
    amount: number
    currency: string
  }) => PaymentSession
  capture: (sessionId: string) => PaymentResult
  expire: (sessionId: string) => boolean
}

export interface IInvoiceEngine {
  create: (input: InvoiceDraftInput) => InvoiceLifecycle
}

export interface ISubscriptionEngine {
  subscribe: (userId: string, planName: SubscriptionPlanName) => SubscriptionLifecycleResult
  renew: (userId: string) => SubscriptionLifecycleResult
  cancel: (userId: string) => SubscriptionLifecycleResult
  upgrade: (userId: string, targetPlan: SubscriptionPlanName) => SubscriptionLifecycleResult
  downgrade: (userId: string, targetPlan: SubscriptionPlanName) => SubscriptionLifecycleResult
}

export interface IPaymentEngine {
  providers: () => PaymentProvider[]
  registerMethod: (input: Omit<PaymentMethod, 'id'>) => PaymentMethod
  createSession: (input: {
    provider: PaymentProvider['name']
    invoiceId: string
    userId: string
    amount: number
    currency: string
  }) => PaymentSession
  payInvoice: (sessionId: string, methodId: string) => PaymentResult
}

export interface ITaxCalculator {
  calculate: (country: string, subtotal: number) => TaxCalculation
}

export interface ICouponEngine {
  apply: (code: string, subtotal: number) => CouponApplication | null
}
