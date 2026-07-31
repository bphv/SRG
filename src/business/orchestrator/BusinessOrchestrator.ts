import { BillingEngine } from '#/business/billing'
import { CreditEngine } from '#/business/credits'
import { IdentityEngine } from '#/business/identity'
import { WalletEngine } from '#/business/wallet'
import { BusinessContextBuilder } from '#/business/orchestrator/BusinessContext'
import { BusinessEvents } from '#/business/orchestrator/BusinessEvents'
import type { IBusinessOrchestrator } from '#/business/orchestrator/interfaces'
import { BusinessState } from '#/business/orchestrator/BusinessState'
import { BusinessWorkflow } from '#/business/orchestrator/BusinessWorkflow'
import type {
  AccountCreationInput,
  BusinessOrchestratorContext,
  GenerationWorkflowInput,
  GenerationWorkflowResult,
  LoginSessionOptions,
  LoginResult,
  PaymentWorkflowInput,
  PaymentWorkflowResult,
  SessionHistoryEntry,
  SubscriptionWorkflowResult,
  ValidateSessionResult,
} from '#/business/orchestrator/types'

export class BusinessOrchestrator implements IBusinessOrchestrator {
  readonly identity: IdentityEngine
  readonly wallet: WalletEngine
  readonly credits: CreditEngine
  readonly billing: BillingEngine

  readonly events: BusinessEvents
  readonly state: BusinessState

  private readonly workflow: BusinessWorkflow
  private readonly contextBuilder: BusinessContextBuilder

  constructor() {
    this.identity = new IdentityEngine()
    this.wallet = new WalletEngine()
    this.credits = new CreditEngine()
    this.billing = new BillingEngine()

    this.events = new BusinessEvents()
    this.state = new BusinessState()
    this.workflow = new BusinessWorkflow(this.identity, this.wallet, this.credits, this.billing, this.events, this.state)
    this.contextBuilder = new BusinessContextBuilder(this.state, this.events)
  }

  createAccount(input: AccountCreationInput): BusinessOrchestratorContext {
    return this.workflow.createAccount(input)
  }

  login(identifier: string, password: string, options: LoginSessionOptions = {}): LoginResult {
    return this.workflow.login(identifier, password, options)
  }

  logout(sessionId: string): boolean {
    return this.workflow.logout(sessionId)
  }

  logoutAllDevices(userId: string, exceptSessionId?: string): number {
    return this.workflow.logoutAllDevices(userId, exceptSessionId)
  }

  refresh(sessionId: string): LoginResult {
    return this.workflow.refresh(sessionId)
  }

  validateSession(sessionId: string): ValidateSessionResult {
    return this.workflow.validateSession(sessionId)
  }

  getSessionHistory(userId: string): SessionHistoryEntry[] {
    return this.workflow.getSessionHistory(userId)
  }

  runGeneration(input: GenerationWorkflowInput): Promise<GenerationWorkflowResult> {
    return this.workflow.runGeneration(input)
  }

  processPayment(input: PaymentWorkflowInput): PaymentWorkflowResult {
    return this.workflow.processPayment(input)
  }

  subscribe(userId: string, planName: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    return this.workflow.subscribe(userId, planName)
  }

  renew(userId: string): SubscriptionWorkflowResult {
    return this.workflow.renew(userId)
  }

  cancel(userId: string): SubscriptionWorkflowResult {
    return this.workflow.cancel(userId)
  }

  upgrade(userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    return this.workflow.upgrade(userId, targetPlan)
  }

  downgrade(userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    return this.workflow.downgrade(userId, targetPlan)
  }

  expire(userId: string): SubscriptionWorkflowResult {
    return this.workflow.expire(userId)
  }

  credit(userId: string, amount: number, note?: string) {
    return this.wallet.credit(userId, amount, note)
  }

  debit(userId: string, amount: number, note?: string) {
    return this.wallet.debit(userId, amount, note)
  }

  reserveWallet(userId: string, amount: number, reason: string) {
    return this.wallet.reserve(userId, amount, reason)
  }

  releaseWallet(userId: string, reservationId: string, reason?: string) {
    return this.wallet.release(userId, reservationId, reason)
  }

  refundWallet(userId: string, amount: number, note?: string) {
    return this.wallet.refund(userId, amount, note)
  }

  estimateCredits(input: GenerationWorkflowInput) {
    return this.credits.estimate({
      model: input.model,
      inputTokens: input.inputTokens,
      outputTokens: input.outputTokens,
      streaming: input.streaming,
    })
  }

  reserveCredits(userId: string, amount: number, reason: string, linkedRunId?: string) {
    return this.credits.reserve(userId, amount, reason, linkedRunId)
  }

  consumeCredits(userId: string, amount: number, reason: string, linkedRunId?: string) {
    return this.credits.consume(userId, amount, reason, linkedRunId)
  }

  rollbackCredits(userId: string, reservationId: string, reason?: string) {
    return this.credits.release(userId, reservationId, reason)
  }

  getContext(userId?: string): BusinessOrchestratorContext {
    return this.contextBuilder.build(userId)
  }

  getTimeline(userId?: string): BusinessOrchestratorContext['timeline'] {
    return this.state.getTimeline(userId)
  }

  getEvents(userId?: string): BusinessOrchestratorContext['events'] {
    return this.events.list(userId)
  }

  runDemoScenario() {
    const accountContext = this.createAccount({
      phone: '+33111111111',
      email: 'demo.user@srg.local',
      password: 'Srg@2026!Demo',
      role: 'User',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        country: 'France',
        city: 'Paris',
        preferredLanguage: 'fr',
        timezone: 'Europe/Paris',
      },
    })

    if (!accountContext.user) {
      throw new Error('Demo scenario failed: account not created.')
    }

    const userId = accountContext.user.id
    const invoice = this.billing.createInvoice({ userId, subtotal: 15, currency: 'EUR' })
    const providers = this.billing.providers()
    const method = this.billing.registerPaymentMethod({
      userId,
      provider: providers[0]?.name ?? 'Stripe',
      type: 'card',
      label: 'Demo Card',
      last4: '4242',
    })

    const paymentResult = this.processPayment({
      userId,
      provider: providers[0]?.name ?? 'Stripe',
      invoiceId: invoice.invoiceId,
      amount: invoice.amount,
      currency: invoice.currency,
      methodId: method.id,
    })

    return {
      account: accountContext,
      payment: paymentResult,
      context: this.getContext(userId),
    }
  }
}
