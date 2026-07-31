import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { IPaymentEngine, PaymentGateway } from '#/business/billing/interfaces'
import type { PaymentMethod, PaymentProvider, PaymentResult, PaymentSession } from '#/business/billing/types'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const PROVIDER_LABEL_TO_NAME: Record<string, PaymentProvider['name']> = {
  Stripe: 'Stripe',
  Flutterwave: 'Flutterwave',
  PayPal: 'PayPal',
  CinetPay: 'CinetPay',
  'Orange Money': 'Orange Money',
  'MTN Mobile Money': 'MTN Mobile Money',
}

class StubPaymentGateway implements PaymentGateway {
  private readonly sessions = new Map<string, PaymentSession>()

  createSession(input: {
    provider: PaymentProvider['name']
    invoiceId: string
    userId: string
    amount: number
    currency: string
  }): PaymentSession {
    const session: PaymentSession = {
      id: randomId('psess'),
      provider: input.provider,
      invoiceId: input.invoiceId,
      userId: input.userId,
      amount: Number(input.amount.toFixed(2)),
      currency: input.currency,
      createdAt: new Date().toISOString(),
      status: 'created',
    }

    this.sessions.set(session.id, session)
    return session
  }

  capture(sessionId: string): PaymentResult {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { success: false, reason: 'session_not_found' }
    }

    session.status = 'captured'
    return {
      success: true,
      providerReference: `stub-${session.id}`,
    }
  }

  expire(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    session.status = 'failed'
    return true
  }

  getSession(sessionId: string): PaymentSession | undefined {
    return this.sessions.get(sessionId)
  }
}

export class PaymentEngine implements IPaymentEngine {
  private readonly gateway = new StubPaymentGateway()

  providers(): PaymentProvider[] {
    const adapters = BusinessFoundationService.getPaymentProviders()
    return adapters.map((adapter) => {
      const mappedName = PROVIDER_LABEL_TO_NAME[adapter.label]
      return {
        id: adapter.id,
        name: mappedName,
        supports: adapter.supports.filter(
          (item): item is PaymentProvider['supports'][number] =>
            item === 'card' || item === 'bank' || item === 'mobile-money' || item === 'wallet',
        ),
        mode: 'stub',
      }
    })
  }

  registerMethod(input: Omit<PaymentMethod, 'id'>): PaymentMethod {
    const normalizedProvider = input.provider === 'MTN Mobile Money' ? 'mtn-momo' : input.provider.toLowerCase().replace(' ', '-')
    const created = BusinessFoundationService.addPaymentMethod({
      userId: input.userId,
      type: input.type,
      provider: normalizedProvider,
      last4: input.last4,
      label: input.label,
    })

    return {
      id: created.id,
      userId: created.userId,
      type: created.type,
      provider: input.provider,
      label: created.label,
      last4: created.last4,
    }
  }

  createSession(input: {
    provider: PaymentProvider['name']
    invoiceId: string
    userId: string
    amount: number
    currency: string
  }): PaymentSession {
    return this.gateway.createSession(input)
  }

  payInvoice(sessionId: string, methodId: string): PaymentResult {
    const session = this.gateway.getSession(sessionId)
    if (!session) {
      return { success: false, reason: 'session_not_found' }
    }

    const capture = this.gateway.capture(sessionId)
    if (!capture.success) {
      return capture
    }

    const payment = BusinessFoundationService.recordPayment({
      invoiceId: session.invoiceId,
      userId: session.userId,
      methodId,
      provider: session.provider,
      amount: session.amount,
    })

    return {
      success: true,
      paymentId: payment.id,
      providerReference: capture.providerReference,
    }
  }
}
