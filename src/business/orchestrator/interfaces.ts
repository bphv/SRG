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

export interface IBusinessWorkflow {
  createAccount: (input: AccountCreationInput) => BusinessOrchestratorContext
  login: (identifier: string, password: string, options?: LoginSessionOptions) => LoginResult
  logout: (sessionId: string) => boolean
  logoutAllDevices: (userId: string, exceptSessionId?: string) => number
  refresh: (sessionId: string) => LoginResult
  validateSession: (sessionId: string) => ValidateSessionResult
  getSessionHistory: (userId: string) => SessionHistoryEntry[]
  runGeneration: (input: GenerationWorkflowInput) => Promise<GenerationWorkflowResult>
  processPayment: (input: PaymentWorkflowInput) => PaymentWorkflowResult
  subscribe: (userId: string, planName: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise') => SubscriptionWorkflowResult
  renew: (userId: string) => SubscriptionWorkflowResult
  cancel: (userId: string) => SubscriptionWorkflowResult
  upgrade: (userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise') => SubscriptionWorkflowResult
  downgrade: (userId: string, targetPlan: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise') => SubscriptionWorkflowResult
  expire: (userId: string) => SubscriptionWorkflowResult
}

export interface IBusinessOrchestrator extends IBusinessWorkflow {
  getContext: (userId?: string) => BusinessOrchestratorContext
  getTimeline: (userId?: string) => BusinessOrchestratorContext['timeline']
  getEvents: (userId?: string) => BusinessOrchestratorContext['events']
}
