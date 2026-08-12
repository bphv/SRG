import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  BusinessFoundationService
  
  
  
  
} from '#/app/services/business/BusinessFoundationService'
import type { AccountStatus, AuthResult, BusinessSnapshot, FeatureFlagKey, UserIdentity, UserRole } from '#/app/services/business/BusinessFoundationService'
import { AuthAccountService } from '#/app/services/business/AuthAccountService'
import type { RegistrationWizardInput, Step1Validation, Step3Validation } from '#/app/services/business/AuthAccountService'
import type { DeviceSession, SecurityEvent } from '#/app/services/business/session/types'
import { BusinessOrchestrator } from '#/business/orchestrator'
import type {
  GenerationWorkflowInput,
  GenerationWorkflowResult,
  LoginSessionOptions,
  SessionHistoryEntry,
} from '#/business/orchestrator'
import type { OtpProviderName } from '#/business/identity'
import type { GenerationResponse } from '#/generator/response/GenerationResponse'
import type { ExecutionResponse } from '#/execution/response/ExecutionResponse'
import type { CreditEstimate } from '#/business/credits'

const businessOrchestrator = new BusinessOrchestrator()
const authAccountService = new AuthAccountService(businessOrchestrator)

function normalizeProvider(
  provider: string,
): 'Stripe' | 'Flutterwave' | 'PayPal' | 'CinetPay' | 'Orange Money' | 'MTN Mobile Money' {
  const key = provider.trim().toLowerCase()
  if (key === 'flutterwave') return 'Flutterwave'
  if (key === 'paypal') return 'PayPal'
  if (key === 'cinetpay') return 'CinetPay'
  if (key === 'orange money' || key === 'orange-money') return 'Orange Money'
  if (key === 'mtn mobile money' || key === 'mtn-momo') return 'MTN Mobile Money'
  return 'Stripe'
}

type BusinessContextValue = {
  snapshot: BusinessSnapshot
  orchestrationContext: ReturnType<BusinessOrchestrator['getContext']>
  currentSession?: DeviceSession
  refresh: () => void
  restorePersistedSession: () => DeviceSession | undefined
  validateRegistrationStep1: (input: RegistrationWizardInput['personal']) => Step1Validation
  validateRegistrationStep3: (input: RegistrationWizardInput['security']) => Step3Validation
  registerAccount: (input: RegistrationWizardInput) => UserIdentity
  loginWithSession: (identifier: string, password: string, options?: LoginSessionOptions) => {
    success: boolean
    sessionId?: string
    reason?: string
    accountStatus?: AccountStatus
    requiresApproval?: boolean
  }
  logoutSession: (sessionId: string) => boolean
  logoutAllUserSessions: (userId: string, exceptSessionId?: string) => number
  revokeUserSessions: (userId: string, sessionIds: string[]) => number
  getSessionHistory: (userId: string) => SessionHistoryEntry[]
  getSecurityEvents: (userId?: string) => SecurityEvent[]
  getConnectedDevices: (userId: string) => DeviceSession['device'][]
  changePassword: (userId: string, currentPassword: string, nextPassword: string) => void
  changePhone: (userId: string, phone: string) => void
  changeLanguage: (userId: string, language: string) => void
  getUserProfileSnapshot: (userId: string) => {
    userId: string
    matricule: string
    username: string
    phone: string
    language: string
    country: string
    city: string
    company?: string
    wallet: number
    credits: number
    plan: string
    lastLoginAt?: string
    connectedDevices: number
    passwordLastChangedAt?: string
    passwordExpiresAt?: string
    passwordExpirationWarning: boolean
    passwordHistoryCount: number
    temporaryLockoutUntil?: string
  } | undefined
  getPasswordPolicySnapshot: (userId: string) => {
    maxAgeDays: number
    warningBeforeExpiryDays: number
    historyLimit: number
    historyCount: number
    lastChangedAt?: string
    expiresAt?: string
    shouldWarn: boolean
    temporaryLockoutMinutes: number
    lockedUntil?: string
  }
  startForgotPasswordByPhone: (phone: string, provider?: OtpProviderName) => { sessionId: string; expiresAt: string; provider: OtpProviderName; sandboxCode?: string }
  verifyForgotPasswordOtp: (sessionId: string, code: string) => boolean
  resetPasswordWithOtp: (sessionId: string, newPassword: string) => void
  adminCounts: ReturnType<typeof BusinessFoundationService.getAdminCounts>
  authenticate: (identifier: string, password: string) => AuthResult
  requestForgotPassword: (identifier: string) => { ticketId: string }
  resetPassword: (ticketId: string, newPassword: string) => void
  createUser: (input: {
    username: string
    phone: string
    email?: string
    password: string
    role: UserRole
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
  }) => void
  createOrganization: (input: { name: string; legalName: string; country: string; city: string }) => void
  createDepartment: (input: { organizationId: string; name: string; managerUserId?: string }) => void
  createTeam: (input: { departmentId: string; name: string; leadUserId?: string }) => void
  setUserRole: (userId: string, role: UserRole) => void
  approveUser: (userId: string, adminId: string) => UserIdentity
  rejectUser: (userId: string, adminId: string, reason?: string) => UserIdentity
  suspendUser: (userId: string, adminId: string, reason?: string) => UserIdentity
  reactivateUser: (userId: string, adminId: string) => UserIdentity
  toggleFeatureFlag: (userId: string, key: FeatureFlagKey, enabled: boolean) => void
  rechargeWallet: (userId: string, amount: number, note?: string) => void
  addWalletBonus: (userId: string, amount: number, note?: string) => void
  reserveCredit: (userId: string, amount: number, reason: string, linkedRunId?: string) => void
  consumeReservedCredit: (userId: string, amount: number, reason: string, linkedRunId?: string) => void
  refundCredit: (userId: string, amount: number, reason: string, linkedRunId?: string) => void
  createSubscription: (input: { userId: string; planName: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise' }) => void
  createInvoice: (input: { userId: string; amount: number; currency?: string; taxAmount?: number }) => void
  addPaymentMethod: (input: {
    userId: string
    type: 'card' | 'bank' | 'mobile-money' | 'wallet'
    provider: string
    last4?: string
    label: string
  }) => void
  recordPayment: (input: { invoiceId: string; userId: string; methodId: string; provider: string; amount: number }) => void
  issueLicense: (input: {
    ownerType: 'organization' | 'user'
    ownerId: string
    planName: 'Free' | 'Starter' | 'Professional' | 'Business' | 'Enterprise'
    seats: number
    expiresAt: string
  }) => void
  captureGenerationExecution: (input: {
    userId: string
    generationId: string
    requestId: string
    generationResponse: GenerationResponse
    executionResponse?: ExecutionResponse
    provider: string
    model: string
  }) => void
  runBusinessDemoScenario: () => void
  estimateGenerationCredits: (input: {
    userId: string
    model: GenerationWorkflowInput['model']
    inputTokens: number
    outputTokens: number
    streaming?: boolean
  }) => CreditEstimate
  validateGenerationReadiness: (input: {
    userId: string
    model: GenerationWorkflowInput['model']
    inputTokens: number
    outputTokens: number
    streaming?: boolean
  }) => {
    ok: boolean
    reasons: string[]
    estimate: CreditEstimate
    context: ReturnType<BusinessOrchestrator['getContext']>
  }
  runGenerationWorkflow: (input: GenerationWorkflowInput) => Promise<GenerationWorkflowResult>
  getGenerationObservability: (userId?: string) => ReturnType<BusinessOrchestrator['getContext']>
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<BusinessSnapshot>(BusinessFoundationService.getSnapshot())
  const [currentSession, setCurrentSession] = useState<DeviceSession | undefined>(
    authAccountService.restorePersistedSession(),
  )

  const refresh = () => {
    setSnapshot(BusinessFoundationService.getSnapshot())
  }

  useEffect(() => {
    setCurrentSession(authAccountService.restorePersistedSession())
  }, [])

  const value = useMemo<BusinessContextValue>(
    () => ({
      snapshot,
      orchestrationContext: businessOrchestrator.getContext(snapshot.users[0]?.id),
      currentSession,
      refresh,
      restorePersistedSession: () => {
        const restored = authAccountService.restorePersistedSession()
        setCurrentSession(restored)
        return restored
      },
      validateRegistrationStep1: (input) => authAccountService.validateStep1(input),
      validateRegistrationStep3: (input) => authAccountService.validateStep3(input),
      registerAccount: (input) => {
        const user = authAccountService.registerFromWizard(input)
        refresh()
        return user
      },
      loginWithSession: (identifier, password, options = {}) => {
        const login = authAccountService.login(identifier, password, options)
        if (!login.success || !login.session) {
          return {
            success: false,
            reason: login.reason,
            accountStatus: login.accountStatus,
            requiresApproval: login.accountAccess?.allowed === false,
          }
        }

        setCurrentSession(authAccountService.getActiveSession())
        return {
          success: true,
          sessionId: login.session.id,
          accountStatus: login.accountStatus,
          requiresApproval: login.accountAccess?.allowed === false,
        }
      },
      logoutSession: (sessionId) => {
        const ok = authAccountService.logout(sessionId)
        setCurrentSession(authAccountService.getActiveSession())
        return ok
      },
      logoutAllUserSessions: (userId, exceptSessionId) => authAccountService.logoutAllDevices(userId, exceptSessionId),
      revokeUserSessions: (userId, sessionIds) => authAccountService.revokeSessions(userId, sessionIds),
      getSessionHistory: (userId) => authAccountService.getSessionHistory(userId),
      getSecurityEvents: (userId) => authAccountService.getSecurityEvents(userId),
      getConnectedDevices: (userId) => authAccountService.getConnectedDevices(userId),
      changePassword: (userId, currentPassword, nextPassword) => {
        authAccountService.changePassword(userId, currentPassword, nextPassword)
      },
      changePhone: (userId, phone) => {
        authAccountService.changePhone(userId, phone)
        refresh()
      },
      changeLanguage: (userId, language) => {
        authAccountService.changeLanguage(userId, language)
        refresh()
      },
      getUserProfileSnapshot: (userId) => authAccountService.getUserProfileSnapshot(userId),
      getPasswordPolicySnapshot: (userId) => authAccountService.getPasswordPolicySnapshot(userId),
      startForgotPasswordByPhone: (phone, provider = 'Twilio') => {
        const challenge = authAccountService.startForgotPasswordByPhone(phone, provider)
        return {
          sessionId: challenge.sessionId,
          expiresAt: challenge.expiresAt,
          provider: challenge.provider,
          sandboxCode: challenge.sandboxCode,
        }
      },
      verifyForgotPasswordOtp: (sessionId, code) => authAccountService.verifyForgotPasswordOtp(sessionId, code),
      resetPasswordWithOtp: (sessionId, newPassword) => {
        authAccountService.resetPasswordWithOtp(sessionId, newPassword)
        refresh()
      },
      adminCounts: BusinessFoundationService.getAdminCounts(),
      authenticate: (identifier, password) => {
        const login = businessOrchestrator.login(identifier, password)
        if (!login.success || !login.session) {
          return { success: false, reason: login.reason }
        }

        const user = BusinessFoundationService.getSnapshot().users.find((item) => item.id === login.session!.userId)
        if (!user) {
          return { success: false, reason: 'user_not_found' }
        }

        return { success: true, user }
      },
      requestForgotPassword: (identifier) => BusinessFoundationService.requestForgotPassword(identifier),
      resetPassword: (ticketId, newPassword) => {
        BusinessFoundationService.resetPassword(ticketId, newPassword)
        refresh()
      },
      createUser: (input) => {
        businessOrchestrator.createAccount(input)
        refresh()
      },
      createOrganization: (input) => {
        BusinessFoundationService.createOrganization(input)
        refresh()
      },
      createDepartment: (input) => {
        BusinessFoundationService.createDepartment(input)
        refresh()
      },
      createTeam: (input) => {
        BusinessFoundationService.createTeam(input)
        refresh()
      },
      setUserRole: (userId, role) => {
        BusinessFoundationService.setUserRole(userId, role)
        refresh()
      },
      approveUser: (userId, adminId) => {
        const user = authAccountService.approveUser(userId, adminId)
        refresh()
        return user
      },
      rejectUser: (userId, adminId, reason) => {
        const user = authAccountService.rejectUser(userId, adminId, reason)
        refresh()
        return user
      },
      suspendUser: (userId, adminId, reason) => {
        const user = authAccountService.suspendUser(userId, adminId, reason)
        refresh()
        return user
      },
      reactivateUser: (userId, adminId) => {
        const user = authAccountService.reactivateUser(userId, adminId)
        refresh()
        return user
      },
      toggleFeatureFlag: (userId, key, enabled) => {
        BusinessFoundationService.toggleFeatureFlag(userId, key, enabled)
        refresh()
      },
      rechargeWallet: (userId, amount, note) => {
        businessOrchestrator.credit(userId, amount, note)
        refresh()
      },
      addWalletBonus: (userId, amount, note) => {
        BusinessFoundationService.addWalletBonus(userId, amount, note)
        refresh()
      },
      reserveCredit: (userId, amount, reason, linkedRunId) => {
        businessOrchestrator.reserveCredits(userId, amount, reason, linkedRunId)
        refresh()
      },
      consumeReservedCredit: (userId, amount, reason, linkedRunId) => {
        businessOrchestrator.consumeCredits(userId, amount, reason, linkedRunId)
        refresh()
      },
      refundCredit: (userId, amount, reason, linkedRunId) => {
        businessOrchestrator.credits.refund(userId, amount, reason, linkedRunId)
        refresh()
      },
      createSubscription: (input) => {
        authAccountService.requireApprovedAccount(input.userId)
        businessOrchestrator.subscribe(input.userId, input.planName)
        refresh()
      },
      createInvoice: (input) => {
        businessOrchestrator.billing.createInvoice({
          userId: input.userId,
          subtotal: input.amount,
          currency: input.currency,
        })
        refresh()
      },
      addPaymentMethod: (input) => {
        BusinessFoundationService.addPaymentMethod(input)
        refresh()
      },
      recordPayment: (input) => {
        authAccountService.requireApprovedAccount(input.userId)
        const invoice = BusinessFoundationService.getSnapshot().invoices.find((item) => item.id === input.invoiceId)
        if (!invoice) {
          throw new Error('Invoice not found for payment workflow.')
        }

        businessOrchestrator.processPayment({
          userId: input.userId,
          provider: normalizeProvider(input.provider),
          invoiceId: input.invoiceId,
          amount: input.amount,
          currency: invoice.currency,
          methodId: input.methodId,
        })
        refresh()
      },
      issueLicense: (input) => {
        BusinessFoundationService.issueLicense(input)
        refresh()
      },
      captureGenerationExecution: (input) => {
        BusinessFoundationService.captureGenerationExecution(input)
        refresh()
      },
      runBusinessDemoScenario: () => {
        businessOrchestrator.runDemoScenario()
        refresh()
      },
      estimateGenerationCredits: (input) =>
        businessOrchestrator.estimateCredits({
          userId: input.userId,
          model: input.model,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          streaming: input.streaming,
        }),
      validateGenerationReadiness: (input) => {
        try {
          authAccountService.requireApprovedAccount(input.userId)
        } catch (error) {
          const reason = error instanceof Error ? error.message : 'ACCOUNT_PENDING_APPROVAL'
          return {
            ok: false,
            reasons: [reason],
            estimate: businessOrchestrator.estimateCredits({
              userId: input.userId,
              model: input.model,
              inputTokens: input.inputTokens,
              outputTokens: input.outputTokens,
              streaming: input.streaming,
            }),
            context: businessOrchestrator.getContext(input.userId),
          }
        }

        const context = businessOrchestrator.getContext(input.userId)
        const estimate = businessOrchestrator.estimateCredits({
          userId: input.userId,
          model: input.model,
          inputTokens: input.inputTokens,
          outputTokens: input.outputTokens,
          streaming: input.streaming,
        })

        const reasons: string[] = []
        if (!context.subscription || context.subscription.status !== 'active') {
          reasons.push('Subscription inactive or missing.')
        }
        if (!context.wallet || context.wallet.total <= 0) {
          reasons.push('Wallet balance is insufficient.')
        }
        if (!context.credits || context.credits.available < estimate.estimatedCredits) {
          reasons.push('Insufficient credits for this generation.')
        }

        return {
          ok: reasons.length === 0,
          reasons,
          estimate,
          context,
        }
      },
      runGenerationWorkflow: (input) => {
        authAccountService.requireApprovedAccount(input.userId)
        return businessOrchestrator.runGeneration(input)
      },
      getGenerationObservability: (userId) => businessOrchestrator.getContext(userId),
    }),
    [currentSession, snapshot],
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusinessContext() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error('useBusinessContext must be used inside BusinessProvider')
  }
  return context
}
