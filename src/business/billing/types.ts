import type { SubscriptionPlanName, UserSubscription } from '#/app/services/business/BusinessFoundationService'

export type PaymentProviderName =
  | 'Stripe'
  | 'Flutterwave'
  | 'PayPal'
  | 'CinetPay'
  | 'Orange Money'
  | 'MTN Mobile Money'

export type PaymentMethodType = 'card' | 'bank' | 'mobile-money' | 'wallet'

export type PaymentMethod = {
  id: string
  userId: string
  provider: PaymentProviderName
  type: PaymentMethodType
  label: string
  last4?: string
}

export type PaymentProvider = {
  id: string
  name: PaymentProviderName
  supports: PaymentMethodType[]
  mode: 'stub'
}

export type PaymentSession = {
  id: string
  provider: PaymentProviderName
  invoiceId: string
  userId: string
  amount: number
  currency: string
  createdAt: string
  status: 'created' | 'authorized' | 'captured' | 'failed'
}

export type PaymentResult = {
  success: boolean
  paymentId?: string
  providerReference?: string
  reason?: string
}

export type InvoiceDraftInput = {
  userId: string
  subtotal: number
  currency?: string
  country?: string
  couponCode?: string
}

export type InvoiceLifecycle = {
  invoiceId: string
  status: 'issued' | 'paid' | 'cancelled'
  amount: number
  currency: string
}

export type SubscriptionLifecycleResult = {
  subscription: UserSubscription
  previousPlan?: SubscriptionPlanName
  action: 'subscribe' | 'renew' | 'cancel' | 'upgrade' | 'downgrade'
}

export type CouponApplication = {
  code: string
  discountPercent: number
  discountAmount: number
}

export type TaxCalculation = {
  country: string
  ratePercent: number
  taxAmount: number
}
