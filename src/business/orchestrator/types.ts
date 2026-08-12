import type {
  AccountStatus,
  FeatureFlagKey,
  SubscriptionPlanName,
  UserIdentity,
  UserSubscription,
} from '#/app/services/business/BusinessFoundationService'
import type { CreditEstimate } from '#/business/credits'
import type { PaymentResult, PaymentSession } from '#/business/billing'

export type BusinessEventType =
  | 'UserCreated'
  | 'WalletCreated'
  | 'CreditsReserved'
  | 'CreditsConsumed'
  | 'SubscriptionCreated'
  | 'InvoiceGenerated'
  | 'PaymentSucceeded'
  | 'PaymentFailed'
  | 'GenerationStarted'
  | 'GenerationCompleted'
  | 'GenerationFailed'

export type OrchestratorWorkflowName =
  | 'account.create'
  | 'session.login'
  | 'session.logout'
  | 'session.refresh'
  | 'session.validate'
  | 'generation.run'
  | 'payment.process'
  | 'subscription.manage'
  | 'wallet.operation'
  | 'credits.operation'

export type BusinessEvent = {
  id: string
  type: BusinessEventType
  at: string
  userId?: string
  payload?: Record<string, unknown>
}

export type BusinessTimelineEntry = {
  id: string
  at: string
  workflow: OrchestratorWorkflowName
  action: string
  status: 'started' | 'success' | 'failed'
  userId?: string
  details?: Record<string, unknown>
}

export type BusinessMetric = {
  id: string
  at: string
  name: string
  value: number
  unit?: string
  workflow?: OrchestratorWorkflowName
  userId?: string
}

export type BusinessTrace = {
  id: string
  workflow: OrchestratorWorkflowName
  userId?: string
  startedAt: string
  endedAt: string
  status: 'ok' | 'failed'
  diagnosticsId: string
}

export type BusinessDiagnostic = {
  id: string
  at: string
  workflow: OrchestratorWorkflowName
  severity: 'info' | 'warn' | 'error'
  message: string
  userId?: string
  details?: Record<string, unknown>
}

export type BusinessHealth = {
  status: 'ok' | 'degraded'
  lastUpdatedAt: string
  checks: Array<{
    name: 'identity' | 'wallet' | 'credits' | 'billing' | 'foundation'
    status: 'ok' | 'degraded'
    message: string
  }>
}

export type BusinessSession = {
  id: string
  userId: string
  token: string
  createdAt: string
  expiresAt: string
  active: boolean
  rememberMe?: boolean
  deviceId?: string
  deviceName?: string
  userAgent?: string
  ipAddress?: string
  lastActivityAt?: string
}

export type SessionDeviceInput = {
  deviceName?: string
  userAgent?: string
  ipAddress?: string
}

export type LoginSessionOptions = {
  rememberMe?: boolean
  device?: SessionDeviceInput
}

export type SessionHistoryEntry = {
  sessionId: string
  userId: string
  createdAt: string
  lastActivityAt: string
  expiresAt: string
  active: boolean
  rememberMe: boolean
  deviceName: string
  userAgent?: string
  ipAddress?: string
}

export type AccountCreationInput = {
  username?: string
  phone: string
  email?: string
  password: string
  role: 'SuperAdmin' | 'Admin' | 'Manager' | 'User' | 'Guest'
  accountStatus?: AccountStatus
  profile: {
    firstName: string
    lastName: string
    country: string
    city: string
    preferredLanguage: string
    timezone: string
    photoUrl?: string
  }
  organizationId?: string
  departmentId?: string
  teamId?: string
}

export type BusinessOrchestratorContext = {
  user?: UserIdentity
  wallet?: {
    available: number
    reserved: number
    bonus: number
    total: number
  }
  credits?: {
    available: number
    reserved: number
    consumed: number
    refunded: number
  }
  subscription?: UserSubscription
  featureFlags?: Record<FeatureFlagKey, boolean>
  timeline: BusinessTimelineEntry[]
  events: BusinessEvent[]
  diagnostics: BusinessDiagnostic[]
  health: BusinessHealth
}

export type LoginResult = {
  success: boolean
  session?: BusinessSession
  reason?: string
}

export type ValidateSessionResult = {
  valid: boolean
  session?: BusinessSession
  reason?: 'not_found' | 'expired' | 'inactive'
}

export type GenerationWorkflowInput = {
  userId: string
  model: 'GPT5' | 'GPT5-mini' | 'Vision' | 'Image' | 'Audio' | 'Embedding' | 'Streaming'
  inputTokens: number
  outputTokens: number
  streaming?: boolean
  invoiceCurrency?: string
  execute?: () => Promise<{ success: boolean; message?: string; linkedRunId?: string }>
}

export type GenerationWorkflowResult = {
  success: boolean
  estimate: CreditEstimate
  reservationId?: string
  invoiceId?: string
  message?: string
  context: BusinessOrchestratorContext
}

export type PaymentWorkflowInput = {
  userId: string
  provider: 'Stripe' | 'Flutterwave' | 'PayPal' | 'CinetPay' | 'Orange Money' | 'MTN Mobile Money'
  invoiceId: string
  amount: number
  currency: string
  methodId: string
}

export type PaymentWorkflowResult = {
  success: boolean
  session: PaymentSession
  payment: PaymentResult
  context: BusinessOrchestratorContext
}

export type PlanFeatureMatrix = Record<
  'Free' | 'Starter' | 'Professional' | 'Enterprise',
  FeatureFlagKey[]
>

export type SubscriptionWorkflowAction = 'subscribe' | 'renew' | 'cancel' | 'upgrade' | 'downgrade' | 'expire'

export type SubscriptionWorkflowResult = {
  action: SubscriptionWorkflowAction
  plan?: SubscriptionPlanName
  context: BusinessOrchestratorContext
}
