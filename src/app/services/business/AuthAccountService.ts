import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import type { AccountAccess, AccountStatus, FeatureFlagKey, UserIdentity } from '#/app/services/business/BusinessFoundationService'
import type { OtpChallenge, OtpProviderName } from '#/business/identity'
import type { BusinessOrchestrator, LoginSessionOptions, SessionHistoryEntry } from '#/business/orchestrator'
import { LocalStorageSessionStore } from '#/app/services/business/session/LocalStorageSessionStore'
import { SessionRepository } from '#/app/services/business/session/SessionRepository'
import type { DeviceSession, SecurityEvent, SecurityEventType } from '#/app/services/business/session/types'
import { PasswordPolicyService } from '#/app/services/business/security/PasswordPolicyService'
import type { PasswordMetadata } from '#/app/services/business/security/PasswordPolicyService'

type RegistrationPersonalStep = {
  firstName: string
  lastName: string
  username: string
  phone: string
  email?: string
  country: string
  city: string
  language: string
}

type RegistrationCompanyStep = {
  company?: string
  department?: string
  jobTitle?: string
  companySize?: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+'
}

type RegistrationSecurityStep = {
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptPrivacy: boolean
}

export type RegistrationWizardInput = {
  personal: RegistrationPersonalStep
  company: RegistrationCompanyStep
  security: RegistrationSecurityStep
}

export type FieldValidationState = {
  valid: boolean
  message?: string
}

export type Step1Validation = {
  firstName: FieldValidationState
  lastName: FieldValidationState
  username: FieldValidationState
  phone: FieldValidationState
  email: FieldValidationState
  country: FieldValidationState
  city: FieldValidationState
  language: FieldValidationState
  isValid: boolean
}

export type Step3Validation = {
  password: FieldValidationState
  confirmPassword: FieldValidationState
  acceptTerms: FieldValidationState
  acceptPrivacy: FieldValidationState
  strength: 'weak' | 'medium' | 'strong'
  isValid: boolean
}

type ForgotPasswordState = {
  userId: string
  ticketId: string
  verified: boolean
}

type UserProfileSnapshot = {
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
}

type FailedLoginState = {
  attempts: number
  firstFailedAt: string
  lockedUntil?: string
}

type PasswordPolicySnapshot = {
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

export type LoginWithStatusResult = {
  success: boolean
  session?: {
    id: string
    userId: string
  }
  reason?: string
  accountStatus?: AccountStatus
  accountAccess?: AccountAccess
}

function hashForHistory(userId: string, password: string): string {
  let hash = 2166136261
  const value = `${userId}:${password}`
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `ph-${(hash >>> 0).toString(16)}`
}

export class AuthAccountService {
  private readonly forgotState = new Map<string, ForgotPasswordState>()
  private readonly sessionRepository = new SessionRepository(new LocalStorageSessionStore())
  private readonly passwordPolicy = new PasswordPolicyService()
  private readonly passwordMetadata = new Map<string, PasswordMetadata>()
  private readonly failedLoginState = new Map<string, FailedLoginState>()

  constructor(private readonly orchestrator: BusinessOrchestrator) {}

  validateStep1(input: RegistrationPersonalStep): Step1Validation {
    const snapshot = BusinessFoundationService.getSnapshot()

    const username = input.username.trim().toLowerCase()
    const phone = input.phone.trim()
    const email = input.email?.trim() ?? ''

    const usernameExists = snapshot.users.some((user) => user.username.toLowerCase() === username)
    const phoneExists = snapshot.users.some((user) => user.phone.trim() === phone)
    const emailExists =
      email.length > 0 &&
      snapshot.users.some((user) => (user.email ?? '').trim().toLowerCase() === email.toLowerCase())

    const firstName = input.firstName.trim().length > 1
    const lastName = input.lastName.trim().length > 1
    const usernameValid = this.orchestrator.identity.validateUsername(input.username) && !usernameExists
    const phoneValid = this.orchestrator.identity.validatePhone(phone) && !phoneExists
    const emailFormatValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const emailValid = emailFormatValid && !emailExists
    const country = input.country.trim().length > 1
    const city = input.city.trim().length > 1
    const language = input.language.trim().length > 1

    const result: Step1Validation = {
      firstName: { valid: firstName, message: firstName ? undefined : 'Le prénom est requis.' },
      lastName: { valid: lastName, message: lastName ? undefined : 'Le nom est requis.' },
      username: {
        valid: usernameValid,
        message: usernameValid ? undefined : usernameExists ? 'Ce username existe déjà.' : 'Username invalide.',
      },
      phone: {
        valid: phoneValid,
        message: phoneValid ? undefined : phoneExists ? 'Ce numéro existe déjà.' : 'Téléphone invalide.',
      },
      email: {
        valid: emailValid,
        message: emailValid ? undefined : emailExists ? 'Cet email existe déjà.' : 'Email invalide.',
      },
      country: { valid: country, message: country ? undefined : 'Pays requis.' },
      city: { valid: city, message: city ? undefined : 'Ville requise.' },
      language: { valid: language, message: language ? undefined : 'Langue requise.' },
      isValid: firstName && lastName && usernameValid && phoneValid && emailValid && country && city && language,
    }

    return result
  }

  validateStep3(input: RegistrationSecurityStep): Step3Validation {
    const policy = this.passwordPolicy.validateComplexity(input.password)
    const confirmValid = input.password.length > 0 && input.password === input.confirmPassword

    return {
      password: {
        valid: policy.valid,
        message: policy.valid ? undefined : policy.errors[0],
      },
      confirmPassword: {
        valid: confirmValid,
        message: confirmValid ? undefined : 'La confirmation du mot de passe ne correspond pas.',
      },
      acceptTerms: {
        valid: input.acceptTerms,
        message: input.acceptTerms ? undefined : 'Vous devez accepter les conditions générales.',
      },
      acceptPrivacy: {
        valid: input.acceptPrivacy,
        message: input.acceptPrivacy ? undefined : 'Vous devez accepter la politique de confidentialité.',
      },
      strength: policy.strength,
      isValid: policy.valid && confirmValid && input.acceptTerms && input.acceptPrivacy,
    }
  }

  registerFromWizard(input: RegistrationWizardInput): UserIdentity {
    const step1 = this.validateStep1(input.personal)
    if (!step1.isValid) {
      throw new Error('Informations personnelles invalides.')
    }

    const step3 = this.validateStep3(input.security)
    if (!step3.isValid) {
      throw new Error('Informations de sécurité invalides.')
    }

    let organizationId: string | undefined
    let departmentId: string | undefined
    let teamId: string | undefined

    const companyName = input.company.company?.trim()
    if (companyName) {
      const organization = BusinessFoundationService.createOrganization({
        name: companyName,
        legalName: companyName,
        country: input.personal.country,
        city: input.personal.city,
      })
      organizationId = organization.id

      const departmentName = input.company.department?.trim() || 'General'
      const department = BusinessFoundationService.createDepartment({
        organizationId,
        name: departmentName,
      })
      departmentId = department.id

      const teamName = input.company.jobTitle?.trim() || 'Default Team'
      const team = BusinessFoundationService.createTeam({
        departmentId,
        name: teamName,
      })
      teamId = team.id
    }

    const context = this.orchestrator.createAccount({
      username: input.personal.username.trim(),
      phone: input.personal.phone.trim(),
      email: input.personal.email?.trim(),
      password: input.security.password,
      role: 'User',
      accountStatus: 'PENDING_APPROVAL',
      profile: {
        firstName: input.personal.firstName,
        lastName: input.personal.lastName,
        country: input.personal.country,
        city: input.personal.city,
        preferredLanguage: input.personal.language,
        timezone: 'UTC',
      },
      organizationId,
      departmentId,
      teamId,
    })

    if (!context.user) {
      throw new Error('La création de compte a échoué.')
    }

    this.passwordMetadata.set(context.user.id, this.passwordPolicy.updateMetadata(input.security.password))
    this.recordSecurityEvent('login', 'success', 'Account created', { userId: context.user.id })
    return context.user
  }

  login(identifier: string, password: string, options: LoginSessionOptions = {}): LoginWithStatusResult {
    const userId = this.findUserIdByIdentifier(identifier)
    const lockKey = userId ?? identifier.trim().toLowerCase()
    const existingLock = this.failedLoginState.get(lockKey)
    if (existingLock?.lockedUntil && new Date(existingLock.lockedUntil).getTime() > Date.now()) {
      this.recordSecurityEvent('failed-login', 'failed', 'Failed login: account temporarily locked', {
        identifier,
        userId,
        lockedUntil: existingLock.lockedUntil,
      })
      return { success: false, reason: 'temporarily_locked' }
    }

    const result = this.orchestrator.login(identifier, password, options)

    if (!result.success || !result.session) {
      const now = new Date()
      const policyConfig = this.passwordPolicy.getConfig()
      const previous = this.failedLoginState.get(lockKey)
      const nextAttempts = (previous?.attempts ?? 0) + 1
      const shouldLock = nextAttempts >= 5
      const lockedUntil = shouldLock
        ? new Date(now.getTime() + policyConfig.temporaryLockoutMinutes * 60 * 1000).toISOString()
        : undefined

      this.failedLoginState.set(lockKey, {
        attempts: nextAttempts,
        firstFailedAt: previous?.firstFailedAt ?? now.toISOString(),
        lockedUntil,
      })

      this.recordSecurityEvent('failed-login', 'failed', 'Failed login', {
        identifier,
        userId,
        reason: result.reason,
        attempts: nextAttempts,
        lockedUntil,
      })
      return { success: false, reason: result.reason }
    }

    this.failedLoginState.delete(lockKey)

    const deviceSession = this.toDeviceSession(result.session, options)
    this.sessionRepository.saveSession(deviceSession)
    this.recordSecurityEvent('login', 'success', 'Login succeeded', {
      userId: result.session.userId,
      sessionId: result.session.id,
      rememberMe: result.session.rememberMe,
    })

    const accountAccess = BusinessFoundationService.getAccountAccess(result.session.userId)

    return {
      success: true,
      session: {
        id: result.session.id,
        userId: result.session.userId,
      },
      accountStatus: accountAccess.status,
      accountAccess,
    }
  }

  getAccountAccess(userId: string): AccountAccess {
    return BusinessFoundationService.getAccountAccess(userId)
  }

  requireApprovedAccount(userId: string): void {
    BusinessFoundationService.requireApprovedAccount(userId)
  }

  approveUser(userId: string, adminId: string): UserIdentity {
    const updated = BusinessFoundationService.approveUser(userId, adminId)
    this.recordSecurityEvent('login', 'success', 'ACCOUNT_APPROVED', { userId, adminId, action: 'ACCOUNT_APPROVED' })
    return updated
  }

  rejectUser(userId: string, adminId: string, reason?: string): UserIdentity {
    const updated = BusinessFoundationService.rejectUser(userId, adminId, reason)
    this.recordSecurityEvent('failed-login', 'success', 'ACCOUNT_REJECTED', {
      userId,
      adminId,
      action: 'ACCOUNT_REJECTED',
      reason,
    })
    return updated
  }

  suspendUser(userId: string, adminId: string, reason?: string): UserIdentity {
    const updated = BusinessFoundationService.suspendUser(userId, adminId, reason)
    this.recordSecurityEvent('failed-login', 'success', 'ACCOUNT_SUSPENDED', {
      userId,
      adminId,
      action: 'ACCOUNT_SUSPENDED',
      reason,
    })
    return updated
  }

  reactivateUser(userId: string, adminId: string): UserIdentity {
    const updated = BusinessFoundationService.reactivateUser(userId, adminId)
    this.recordSecurityEvent('login', 'success', 'ACCOUNT_REACTIVATED', {
      userId,
      adminId,
      action: 'ACCOUNT_REACTIVATED',
    })
    return updated
  }

  logout(sessionId: string): boolean {
    const current = this.sessionRepository.getSession(sessionId)
    const ok = this.orchestrator.logout(sessionId)
    if (!ok) {
      return false
    }

    this.sessionRepository.expireSession(sessionId)
    if (this.sessionRepository.getActiveSession()?.sessionId === sessionId) {
      this.sessionRepository.clearActiveSession()
    }

    this.recordSecurityEvent('logout', 'success', 'Logout succeeded', {
      userId: current?.userId,
      sessionId,
    })

    return true
  }

  logoutAllDevices(userId: string, exceptSessionId?: string): number {
    const revoked = this.orchestrator.logoutAllDevices(userId, exceptSessionId)
    const persistedRevoked = this.sessionRepository.logoutAllForUser(userId, exceptSessionId)
    this.recordSecurityEvent('logout-all-devices', 'success', 'Logout on all devices executed', {
      userId,
      revoked: Math.max(revoked, persistedRevoked),
    })
    return Math.max(revoked, persistedRevoked)
  }

  revokeSessions(userId: string, sessionIds: string[]): number {
    const allowed = this.sessionRepository
      .history(userId)
      .sessions.filter((session) => session.userId === userId)
      .map((session) => session.sessionId)

    const allowedSet = new Set(allowed)
    const target = sessionIds.filter((sessionId) => allowedSet.has(sessionId))
    if (target.length === 0) {
      return 0
    }

    target.forEach((sessionId) => {
      this.orchestrator.logout(sessionId)
    })

    const revoked = this.sessionRepository.revokeSessions(target)
    const active = this.sessionRepository.getActiveSession()
    if (active && target.includes(active.sessionId)) {
      this.sessionRepository.clearActiveSession()
    }

    this.recordSecurityEvent('device-revoked', 'success', 'Selected sessions revoked', {
      userId,
      sessionIds: target,
      revoked,
    })

    return revoked
  }

  getSessionHistory(userId: string): SessionHistoryEntry[] {
    const history = this.sessionRepository.history(userId)
    return history.sessions.map((session) => ({
      sessionId: session.sessionId,
      userId: session.userId,
      createdAt: session.createdAt,
      lastActivityAt: session.lastActivityAt,
      expiresAt: session.expiresAt,
      active: session.active,
      rememberMe: session.rememberMe,
      deviceName: session.device.deviceName,
      userAgent: `${session.device.browser} / ${session.device.os}`,
      ipAddress: session.device.ipAddress,
    }))
  }

  startForgotPasswordByPhone(phone: string, provider: OtpProviderName = 'Twilio'): OtpChallenge {
    const snapshot = BusinessFoundationService.getSnapshot()
    const user = snapshot.users.find((item) => item.phone.trim() === phone.trim())
    if (!user) {
      throw new Error('Aucun utilisateur trouvé pour ce numéro de téléphone.')
    }

    const challenge = this.orchestrator.identity.otpEngine.requestOtp(phone.trim(), 'password-reset', provider)
    const ticket = BusinessFoundationService.requestForgotPassword(user.username)
    this.forgotState.set(challenge.sessionId, {
      userId: user.id,
      ticketId: ticket.ticketId,
      verified: false,
    })

    this.recordSecurityEvent('otp-request', 'success', 'OTP requested', {
      userId: user.id,
      provider,
      sessionId: challenge.sessionId,
    })

    return challenge
  }

  verifyForgotPasswordOtp(sessionId: string, code: string): boolean {
    const result = this.orchestrator.identity.otpEngine.verifyOtp(sessionId, code)
    if (!result.success) {
      const session = this.orchestrator.identity.otpEngine.getSession(sessionId)
      this.recordSecurityEvent('otp-validation', 'failed', 'OTP validation failed', {
        sessionId,
        reason: result.reason,
        attempts: session?.attempts,
        status: session?.status,
      })
      return false
    }

    const state = this.forgotState.get(sessionId)
    if (!state) {
      return false
    }

    this.forgotState.set(sessionId, { ...state, verified: true })
    this.recordSecurityEvent('otp-validation', 'success', 'OTP validated', {
      userId: state.userId,
      sessionId,
    })
    return true
  }

  resetPasswordWithOtp(sessionId: string, newPassword: string): void {
    const state = this.forgotState.get(sessionId)
    if (!state || !state.verified) {
      throw new Error('Session OTP non vérifiée.')
    }

    const policy = this.passwordPolicy.validateComplexity(newPassword)
    if (!policy.valid) {
      throw new Error(policy.errors[0] ?? 'Mot de passe invalide.')
    }

    if (!this.passwordPolicy.canReuse(newPassword, this.passwordMetadata.get(state.userId))) {
      throw new Error('Ce mot de passe a déjà été utilisé récemment.')
    }

    BusinessFoundationService.resetPassword(state.ticketId, newPassword)
    this.passwordMetadata.set(
      state.userId,
      this.passwordPolicy.updateMetadata(newPassword, this.passwordMetadata.get(state.userId)),
    )
    this.recordSecurityEvent('password-reset', 'success', 'Password reset completed', {
      userId: state.userId,
      sessionId,
    })
    this.forgotState.delete(sessionId)
  }

  restorePersistedSession(): DeviceSession | undefined {
    const active = this.sessionRepository.getActiveSession()
    if (!active) {
      return undefined
    }

    if (!active.active) {
      this.sessionRepository.clearActiveSession()
      return undefined
    }

    if (new Date(active.expiresAt).getTime() < Date.now()) {
      this.sessionRepository.expireSession(active.sessionId)
      this.sessionRepository.clearActiveSession()
      this.recordSecurityEvent('session-expired', 'failed', 'Persisted session expired', {
        userId: active.userId,
        sessionId: active.sessionId,
      })
      return undefined
    }

    this.sessionRepository.touch(active.sessionId)
    return this.sessionRepository.getSession(active.sessionId)
  }

  getActiveSession(): DeviceSession | undefined {
    return this.sessionRepository.getActiveSession()
  }

  getSecurityEvents(userId?: string): SecurityEvent[] {
    const events = this.sessionRepository.listSecurityEvents()
    if (!userId) {
      return events
    }
    return events.filter((event) => event.userId === userId)
  }

  getConnectedDevices(userId: string) {
    return this.sessionRepository
      .history(userId)
      .sessions.filter((session) => session.active)
      .map((session) => ({
        ...session.device,
        lastSeen: session.lastActivityAt,
        currentDevice: this.sessionRepository.getActiveSession()?.sessionId === session.sessionId,
        trustedDevice: session.rememberMe,
      }))
  }

  getPasswordPolicySnapshot(userId: string): PasswordPolicySnapshot {
    const metadata = this.passwordMetadata.get(userId)
    const config = this.passwordPolicy.getConfig()
    const lockState = this.failedLoginState.get(userId)
    const shouldWarn = metadata?.expiresAt ? this.passwordPolicy.shouldWarnBeforeExpiration(metadata.expiresAt) : false
    const historyCount = this.passwordPolicy.historyCounter(metadata)

    return {
      maxAgeDays: config.maxAgeDays,
      warningBeforeExpiryDays: config.warningBeforeExpiryDays,
      historyLimit: config.historyLimit,
      historyCount,
      lastChangedAt: metadata?.lastChangedAt,
      expiresAt: metadata?.expiresAt,
      shouldWarn,
      temporaryLockoutMinutes: config.temporaryLockoutMinutes,
      lockedUntil: lockState?.lockedUntil,
    }
  }

  changePassword(userId: string, currentPassword: string, nextPassword: string): void {
    const user = BusinessFoundationService.getSnapshot().users.find((item) => item.id === userId)
    if (!user) {
      throw new Error('Utilisateur introuvable.')
    }

    const auth = this.orchestrator.identity.authenticate(user.username, currentPassword)
    if (!auth.success) {
      throw new Error('Mot de passe actuel invalide.')
    }

    const check = this.passwordPolicy.validateComplexity(nextPassword)
    if (!check.valid) {
      throw new Error(check.errors[0] ?? 'Nouveau mot de passe invalide.')
    }

    if (!this.passwordPolicy.canReuse(nextPassword, this.passwordMetadata.get(userId))) {
      throw new Error('Le mot de passe a déjà été utilisé récemment.')
    }

    const ticket = BusinessFoundationService.requestForgotPassword(user.username)
    BusinessFoundationService.resetPassword(ticket.ticketId, nextPassword)

    this.passwordMetadata.set(
      userId,
      this.passwordPolicy.updateMetadata(nextPassword, this.passwordMetadata.get(userId)),
    )
    this.recordSecurityEvent('password-reset', 'success', 'Password changed from profile', { userId })
  }

  changePhone(userId: string, phone: string): void {
    BusinessFoundationService.updateUserPhone(userId, phone)
  }

  changeLanguage(userId: string, preferredLanguage: string): void {
    BusinessFoundationService.updateUserPreferredLanguage(userId, preferredLanguage)
  }

  getUserProfileSnapshot(userId: string): UserProfileSnapshot | undefined {
    const snapshot = BusinessFoundationService.getSnapshot()
    const user = snapshot.users.find((item) => item.id === userId)
    const profile = snapshot.profiles.find((item) => item.userId === userId)
    if (!user || !profile) {
      return undefined
    }

    const organization = snapshot.organizations.find((item) => item.id === user.organizationId)
    const wallet = snapshot.wallets.find((item) => item.userId === userId)
    const credits = snapshot.creditAccounts.find((item) => item.userId === userId)
    const subscription = snapshot.subscriptions.find((item) => item.userId === userId)
    const lastLogin = this.getSecurityEvents(userId).find((event) => event.type === 'login' && event.status === 'success')
    const connectedDevices = this.getConnectedDevices(userId)
    const passwordMeta = this.passwordMetadata.get(userId)

    return {
      userId,
      matricule: user.matricule,
      username: user.username,
      phone: user.phone,
      language: profile.preferredLanguage,
      country: profile.country,
      city: profile.city,
      company: organization?.name,
      wallet: Number(((wallet?.balance ?? 0) + (wallet?.bonusBalance ?? 0)).toFixed(2)),
      credits: Number((credits?.available ?? 0).toFixed(2)),
      plan: subscription?.planName ?? 'Free',
      lastLoginAt: lastLogin?.at,
      connectedDevices: connectedDevices.length,
      passwordLastChangedAt: passwordMeta?.lastChangedAt,
      passwordExpiresAt: passwordMeta?.expiresAt,
      passwordExpirationWarning: passwordMeta?.expiresAt
        ? this.passwordPolicy.shouldWarnBeforeExpiration(passwordMeta.expiresAt)
        : false,
      passwordHistoryCount: this.passwordPolicy.historyCounter(passwordMeta),
      temporaryLockoutUntil: this.failedLoginState.get(userId)?.lockedUntil,
    }
  }

  getUserFeatureFlags(userId: string): Record<FeatureFlagKey, boolean> | undefined {
    return BusinessFoundationService.getSnapshot().featureFlagsByUser[userId]
  }

  private toDeviceSession(
    session: {
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
    },
    options: LoginSessionOptions,
  ): DeviceSession {
    const userAgent = session.userAgent ?? options.device?.userAgent ?? ''
    const device = this.parseDeviceInfo(session.deviceId ?? hashForHistory(session.userId, session.id), session.deviceName, userAgent)

    return {
      sessionId: session.id,
      userId: session.userId,
      token: session.token,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt ?? session.createdAt,
      active: session.active,
      rememberMe: session.rememberMe === true,
      device: {
        ...device,
        ipAddress: session.ipAddress ?? options.device?.ipAddress ?? '0.0.0.0',
        lastSeen: session.lastActivityAt ?? session.createdAt,
        currentDevice: true,
        trustedDevice: session.rememberMe === true,
      },
    }
  }

  private findUserIdByIdentifier(identifier: string): string | undefined {
    const needle = identifier.trim().toLowerCase()
    if (!needle) {
      return undefined
    }

    const canonicalMatricule = BusinessFoundationService.normalizeMatriculeInput(identifier)

    const snapshot = BusinessFoundationService.getSnapshot()
    const user = snapshot.users.find((item) => {
      const username = item.username.trim().toLowerCase()
      const matricule = item.matricule.trim().toLowerCase()
      const phone = item.phone.trim().toLowerCase()
      const email = (item.email ?? '').trim().toLowerCase()
      return (
        username === needle ||
        matricule === needle ||
        phone === needle ||
        email === needle ||
        (canonicalMatricule !== undefined && item.matricule === canonicalMatricule)
      )
    })

    return user?.id
  }

  private parseDeviceInfo(deviceId: string, fallbackName: string | undefined, userAgent: string) {
    const ua = userAgent.toLowerCase()
    const browser = ua.includes('edg')
      ? 'Edge'
      : ua.includes('chrome')
      ? 'Chrome'
      : ua.includes('firefox')
      ? 'Firefox'
      : ua.includes('safari')
      ? 'Safari'
      : 'Unknown Browser'

    const os = ua.includes('windows')
      ? 'Windows'
      : ua.includes('mac os')
      ? 'macOS'
      : ua.includes('android')
      ? 'Android'
      : ua.includes('iphone') || ua.includes('ios')
      ? 'iOS'
      : ua.includes('linux')
      ? 'Linux'
      : 'Unknown OS'

    return {
      deviceId,
      deviceName: fallbackName ?? `${browser} on ${os}`,
      browser,
      os,
      ipAddress: '0.0.0.0',
      lastSeen: new Date().toISOString(),
      currentDevice: false,
      trustedDevice: false,
    }
  }

  private recordSecurityEvent(
    type: SecurityEventType,
    status: 'success' | 'failed',
    message: string,
    metadata: Record<string, unknown> = {},
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: `sec-${Math.random().toString(36).slice(2, 10)}`,
      at: new Date().toISOString(),
      userId: typeof metadata.userId === 'string' ? metadata.userId : undefined,
      type,
      status,
      message,
      metadata,
    }

    this.sessionRepository.appendSecurityEvent(event)
    this.orchestrator.state.pushDiagnostic({
      workflow: 'session.validate',
      severity: status === 'success' ? 'info' : 'warn',
      message: `[security] ${type}: ${message}`,
      userId: event.userId,
      details: metadata,
    })

    return event
  }
}
