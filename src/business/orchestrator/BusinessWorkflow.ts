import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { BillingEngine } from '#/business/billing'
import type { CreditEngine } from '#/business/credits'
import type { IdentityEngine } from '#/business/identity'
import type { WalletEngine } from '#/business/wallet'
import { BusinessContextBuilder } from '#/business/orchestrator/BusinessContext'
import type { BusinessEvents } from '#/business/orchestrator/BusinessEvents'
import type { IBusinessWorkflow } from '#/business/orchestrator/interfaces'
import { SessionManager } from '#/business/orchestrator/SessionManager'
import type { BusinessState } from '#/business/orchestrator/BusinessState'
import { BusinessTransactionManager } from '#/business/orchestrator/BusinessTransaction'
import type {
  AccountCreationInput,
  GenerationWorkflowInput,
  GenerationWorkflowResult,
  LoginSessionOptions,
  LoginResult,
  PaymentWorkflowInput,
  PaymentWorkflowResult,
  PlanFeatureMatrix,
  SessionHistoryEntry,
  SubscriptionWorkflowResult,
  ValidateSessionResult,
} from '#/business/orchestrator/types'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const PLAN_FLAGS: PlanFeatureMatrix = {
  Free: ['streaming', 'json'],
  Starter: ['streaming', 'json', 'workflow'],
  Professional: ['streaming', 'json', 'workflow', 'vision', 'image'],
  Enterprise: ['streaming', 'json', 'workflow', 'vision', 'image', 'audio', 'agents', 'marketplace'],
}

export class BusinessWorkflow implements IBusinessWorkflow {
  private readonly sessions = new SessionManager()
  private readonly contextBuilder: BusinessContextBuilder
  private readonly tx = new BusinessTransactionManager()

  constructor(
    private readonly identity: IdentityEngine,
    private readonly wallet: WalletEngine,
    private readonly credits: CreditEngine,
    private readonly billing: BillingEngine,
    private readonly events: BusinessEvents,
    private readonly state: BusinessState,
  ) {
    this.contextBuilder = new BusinessContextBuilder(this.state, this.events)
  }

  createAccount(input: AccountCreationInput) {
    const txn = this.tx.start('account.create')
    const startedAt = new Date().toISOString()
    this.state.pushTimeline({ workflow: 'account.create', action: 'create-account', status: 'started' })

    try {
      const preview = this.identity.generateIdentity({
        usernameBase: input.username,
        firstName: input.profile.firstName,
        lastName: input.profile.lastName,
        phone: input.phone,
        email: input.email,
      })

      const user = this.identity.register({
        username: input.username ?? preview.username,
        phone: input.phone,
        email: input.email,
        password: input.password,
        role: input.role,
        accountStatus: input.accountStatus,
        profile: input.profile,
        organizationId: input.organizationId,
        departmentId: input.departmentId,
        teamId: input.teamId,
      })

      const wallet = this.wallet.balance(user.id)
      this.events.publish('UserCreated', { userId: user.id, matricule: user.matricule }, user.id)
      this.events.publish('WalletCreated', { userId: user.id, total: wallet.total }, user.id)

      const subscription = this.billing.subscribe(user.id, 'Free').subscription
      this.applyFeatureFlagsForPlan(user.id, 'Free')
      this.events.publish('SubscriptionCreated', { userId: user.id, plan: subscription.planName }, user.id)

      this.state.pushMetric({ name: 'account.create.success', value: 1, unit: 'count', workflow: 'account.create', userId: user.id })
      this.state.pushDiagnostic({ workflow: 'account.create', severity: 'info', message: 'Account workflow completed', userId: user.id })
      this.state.pushTrace({
        workflow: 'account.create',
        userId: user.id,
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'ok',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'account.create', action: 'create-account', status: 'success', userId: user.id })
      this.tx.commit(txn.id)
      return this.contextBuilder.build(user.id)
    } catch (error) {
      this.state.pushMetric({ name: 'account.create.failed', value: 1, unit: 'count', workflow: 'account.create' })
      this.state.pushDiagnostic({
        workflow: 'account.create',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Account workflow failed',
      })
      this.state.pushTrace({
        workflow: 'account.create',
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'failed',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'account.create', action: 'create-account', status: 'failed' })
      this.tx.fail(txn.id, error instanceof Error ? error.message : 'unknown')
      throw error
    }
  }

  login(identifier: string, password: string, options: LoginSessionOptions = {}): LoginResult {
    const startedAt = new Date().toISOString()
    const txn = this.tx.start('session.login')
    this.state.pushTimeline({ workflow: 'session.login', action: 'login', status: 'started' })

    const auth = this.identity.authenticate(identifier, password)
    if (!auth.success || !auth.user) {
      this.state.pushMetric({ name: 'session.login.failed', value: 1, workflow: 'session.login' })
      this.state.pushDiagnostic({ workflow: 'session.login', severity: 'warn', message: `Login failed: ${auth.reason ?? 'unknown'}` })
      this.state.pushTrace({
        workflow: 'session.login',
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'failed',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'session.login', action: 'login', status: 'failed' })
      this.tx.rollback(txn.id)
      return { success: false, reason: auth.reason }
    }

    const session = this.sessions.create(auth.user.id, options)

    this.state.pushMetric({ name: 'session.login.success', value: 1, workflow: 'session.login', userId: auth.user.id })
    this.state.pushDiagnostic({ workflow: 'session.login', severity: 'info', message: 'Login succeeded', userId: auth.user.id })
    this.state.pushTrace({
      workflow: 'session.login',
      userId: auth.user.id,
      startedAt,
      endedAt: new Date().toISOString(),
      status: 'ok',
      diagnosticsId: randomId('diag-ref'),
    })
    this.state.pushTimeline({ workflow: 'session.login', action: 'login', status: 'success', userId: auth.user.id })
    this.tx.commit(txn.id)

    return { success: true, session }
  }

  logout(sessionId: string): boolean {
    const txn = this.tx.start('session.logout')
    const session = this.sessions.get(sessionId)
    if (!session) {
      this.state.pushTimeline({ workflow: 'session.logout', action: 'logout', status: 'failed' })
      this.tx.rollback(txn.id)
      return false
    }

    this.sessions.logout(sessionId)
    this.state.pushTimeline({ workflow: 'session.logout', action: 'logout', status: 'success', userId: session.userId })
    this.state.pushMetric({ name: 'session.logout.success', value: 1, workflow: 'session.logout', userId: session.userId })
    this.state.pushDiagnostic({ workflow: 'session.logout', severity: 'info', message: 'Logout succeeded', userId: session.userId })
    this.tx.commit(txn.id)
    return true
  }

  logoutAllDevices(userId: string, exceptSessionId?: string): number {
    const revoked = this.sessions.logoutAllDevices(userId, exceptSessionId)
    this.state.pushTimeline({ workflow: 'session.logout', action: 'logout-all-devices', status: 'success', userId, details: { revoked } })
    this.state.pushMetric({ name: 'session.logout_all.success', value: revoked, workflow: 'session.logout', userId })
    return revoked
  }

  refresh(sessionId: string): LoginResult {
    const txn = this.tx.start('session.refresh')
    const session = this.sessions.refresh(sessionId)
    if (!session || !session.active) {
      this.state.pushTimeline({ workflow: 'session.refresh', action: 'refresh', status: 'failed' })
      this.tx.rollback(txn.id)
      return { success: false, reason: 'inactive' }
    }

    this.state.pushTimeline({ workflow: 'session.refresh', action: 'refresh', status: 'success', userId: session.userId })
    this.state.pushMetric({ name: 'session.refresh.success', value: 1, workflow: 'session.refresh', userId: session.userId })
    this.tx.commit(txn.id)
    return { success: true, session }
  }

  validateSession(sessionId: string): ValidateSessionResult {
    return this.sessions.validate(sessionId)
  }

  getSessionHistory(userId: string): SessionHistoryEntry[] {
    return this.sessions.history(userId)
  }

  async runGeneration(input: GenerationWorkflowInput): Promise<GenerationWorkflowResult> {
    const startedAt = new Date().toISOString()
    const txn = this.tx.start('generation.run', input.userId)
    this.state.pushTimeline({ workflow: 'generation.run', action: 'generation-start', status: 'started', userId: input.userId })

    try {
      BusinessFoundationService.requireApprovedAccount(input.userId)

      const snapshot = BusinessFoundationService.getSnapshot()
      const user = snapshot.users.find((item) => item.id === input.userId)
      if (!user) {
        throw new Error('Identity validation failed: user not found.')
      }

      const subscription = snapshot.subscriptions.find((item) => item.userId === input.userId)
      if (!subscription || subscription.status !== 'active') {
        throw new Error('Subscription validation failed: no active subscription.')
      }

      const walletBalance = this.wallet.balance(input.userId)
      if (walletBalance.total < 0) {
        throw new Error('Wallet validation failed: invalid balance.')
      }

      const estimate = this.credits.estimate({
        model: input.model,
        inputTokens: input.inputTokens,
        outputTokens: input.outputTokens,
        streaming: input.streaming,
      })

      const reservation = this.credits.reserve(input.userId, estimate.estimatedCredits, 'generation reservation')
      this.events.publish('GenerationStarted', { estimate }, input.userId)
      this.events.publish('CreditsReserved', { reservationId: reservation.id, amount: reservation.amount }, input.userId)

      const execution = input.execute ? await input.execute() : { success: true, linkedRunId: randomId('run') }
      if (!execution.success) {
        this.credits.release(input.userId, reservation.id, 'generation failed rollback')
        this.events.publish('GenerationFailed', { reservationId: reservation.id, message: execution.message }, input.userId)
        this.state.pushTimeline({ workflow: 'generation.run', action: 'generation-complete', status: 'failed', userId: input.userId })
        this.state.pushDiagnostic({ workflow: 'generation.run', severity: 'error', message: execution.message ?? 'Generation failed', userId: input.userId })
        this.state.pushTrace({
          workflow: 'generation.run',
          userId: input.userId,
          startedAt,
          endedAt: new Date().toISOString(),
          status: 'failed',
          diagnosticsId: randomId('diag-ref'),
        })
        this.tx.fail(txn.id, execution.message ?? 'generation_failed')

        return {
          success: false,
          estimate,
          reservationId: reservation.id,
          message: execution.message,
          context: this.contextBuilder.build(input.userId),
        }
      }

      this.credits.consume(input.userId, estimate.estimatedCredits, 'generation consumed', execution.linkedRunId)
      this.events.publish('CreditsConsumed', { amount: estimate.estimatedCredits }, input.userId)

      const invoice = this.billing.createInvoice({
        userId: input.userId,
        subtotal: estimate.estimatedCost,
        currency: input.invoiceCurrency ?? 'EUR',
      })
      this.events.publish('InvoiceGenerated', { invoiceId: invoice.invoiceId, amount: invoice.amount }, input.userId)
      this.events.publish('GenerationCompleted', { runId: execution.linkedRunId, invoiceId: invoice.invoiceId }, input.userId)

      this.state.pushMetric({ name: 'generation.run.success', value: 1, unit: 'count', workflow: 'generation.run', userId: input.userId })
      this.state.pushDiagnostic({ workflow: 'generation.run', severity: 'info', message: 'Generation workflow completed', userId: input.userId })
      this.state.pushTrace({
        workflow: 'generation.run',
        userId: input.userId,
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'ok',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'generation.run', action: 'generation-complete', status: 'success', userId: input.userId })
      this.tx.commit(txn.id)

      return {
        success: true,
        estimate,
        reservationId: reservation.id,
        invoiceId: invoice.invoiceId,
        context: this.contextBuilder.build(input.userId),
      }
    } catch (error) {
      this.state.pushTimeline({ workflow: 'generation.run', action: 'generation-complete', status: 'failed', userId: input.userId })
      this.state.pushMetric({ name: 'generation.run.failed', value: 1, unit: 'count', workflow: 'generation.run', userId: input.userId })
      this.state.pushDiagnostic({
        workflow: 'generation.run',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Generation workflow failed',
        userId: input.userId,
      })
      this.state.pushTrace({
        workflow: 'generation.run',
        userId: input.userId,
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'failed',
        diagnosticsId: randomId('diag-ref'),
      })
      this.events.publish('GenerationFailed', { error: error instanceof Error ? error.message : 'unknown' }, input.userId)
      this.tx.fail(txn.id, error instanceof Error ? error.message : 'unknown')
      throw error
    }
  }

  processPayment(input: PaymentWorkflowInput): PaymentWorkflowResult {
    const startedAt = new Date().toISOString()
    const txn = this.tx.start('payment.process', input.userId)
    this.state.pushTimeline({ workflow: 'payment.process', action: 'payment-start', status: 'started', userId: input.userId })

    BusinessFoundationService.requireApprovedAccount(input.userId)

    const session = this.billing.createPaymentSession({
      provider: input.provider,
      invoiceId: input.invoiceId,
      userId: input.userId,
      amount: input.amount,
      currency: input.currency,
    })

    const payment = this.billing.payInvoice(session.id, input.methodId)
    if (payment.success) {
      this.wallet.credit(input.userId, input.amount, 'payment workflow credit')
      this.events.publish('PaymentSucceeded', { invoiceId: input.invoiceId, amount: input.amount }, input.userId)
      this.state.pushMetric({ name: 'payment.process.success', value: 1, workflow: 'payment.process', userId: input.userId })
      this.state.pushDiagnostic({ workflow: 'payment.process', severity: 'info', message: 'Payment workflow succeeded', userId: input.userId })
      this.state.pushTrace({
        workflow: 'payment.process',
        userId: input.userId,
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'ok',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'payment.process', action: 'payment-complete', status: 'success', userId: input.userId })
      this.tx.commit(txn.id)
    } else {
      this.events.publish('PaymentFailed', { invoiceId: input.invoiceId, reason: payment.reason }, input.userId)
      this.state.pushMetric({ name: 'payment.process.failed', value: 1, workflow: 'payment.process', userId: input.userId })
      this.state.pushDiagnostic({ workflow: 'payment.process', severity: 'error', message: payment.reason ?? 'Payment failed', userId: input.userId })
      this.state.pushTrace({
        workflow: 'payment.process',
        userId: input.userId,
        startedAt,
        endedAt: new Date().toISOString(),
        status: 'failed',
        diagnosticsId: randomId('diag-ref'),
      })
      this.state.pushTimeline({ workflow: 'payment.process', action: 'payment-complete', status: 'failed', userId: input.userId })
      this.tx.fail(txn.id, payment.reason ?? 'payment_failed')
    }

    return {
      success: payment.success,
      session,
      payment,
      context: this.contextBuilder.build(input.userId),
    }
  }

  subscribe(userId: string, planName: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.subscribe(userId, planName)
    if (planName === 'Free' || planName === 'Starter' || planName === 'Professional' || planName === 'Enterprise') {
      this.applyFeatureFlagsForPlan(userId, planName)
    }
    this.events.publish('SubscriptionCreated', { action: 'subscribe', plan: planName }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'subscribe', status: 'success', userId })
    return { action: 'subscribe', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  renew(userId: string): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.renew(userId)
    this.events.publish('SubscriptionCreated', { action: 'renew', plan: result.subscription.planName }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'renew', status: 'success', userId })
    return { action: 'renew', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  cancel(userId: string): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.cancel(userId)
    this.events.publish('SubscriptionCreated', { action: 'cancel', plan: result.subscription.planName }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'cancel', status: 'success', userId })
    return { action: 'cancel', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  upgrade(userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.upgrade(userId, targetPlan)
    if (targetPlan === 'Starter' || targetPlan === 'Professional' || targetPlan === 'Enterprise' || targetPlan === 'Free') {
      this.applyFeatureFlagsForPlan(userId, targetPlan)
    }
    this.events.publish('SubscriptionCreated', { action: 'upgrade', plan: targetPlan }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'upgrade', status: 'success', userId })
    return { action: 'upgrade', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  downgrade(userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.downgrade(userId, targetPlan)
    if (targetPlan === 'Starter' || targetPlan === 'Professional' || targetPlan === 'Enterprise' || targetPlan === 'Free') {
      this.applyFeatureFlagsForPlan(userId, targetPlan)
    }
    this.events.publish('SubscriptionCreated', { action: 'downgrade', plan: targetPlan }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'downgrade', status: 'success', userId })
    return { action: 'downgrade', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  expire(userId: string): SubscriptionWorkflowResult {
    BusinessFoundationService.requireApprovedAccount(userId)
    const result = this.billing.cancel(userId)
    this.events.publish('SubscriptionCreated', { action: 'expire', plan: result.subscription.planName }, userId)
    this.state.pushTimeline({ workflow: 'subscription.manage', action: 'expire', status: 'success', userId })
    return { action: 'expire', plan: result.subscription.planName, context: this.contextBuilder.build(userId) }
  }

  private applyFeatureFlagsForPlan(userId: string, plan: 'Free' | 'Starter' | 'Professional' | 'Enterprise'): void {
    const allFlags: Array<'vision' | 'image' | 'streaming' | 'json' | 'audio' | 'workflow' | 'agents' | 'marketplace'> = [
      'vision',
      'image',
      'streaming',
      'json',
      'audio',
      'workflow',
      'agents',
      'marketplace',
    ]
    const enabled = new Set(PLAN_FLAGS[plan])
    allFlags.forEach((flag) => {
      BusinessFoundationService.toggleFeatureFlag(userId, flag, enabled.has(flag))
    })
  }
}
