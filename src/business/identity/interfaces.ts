import type { AuthResult, UserIdentity } from '#/app/services/business/BusinessFoundationService'
import type {
  CreateIdentityInput,
  GenerateIdentityInput,
  GeneratedIdentity,
  OtpChallenge,
  OtpProviderName,
  IdentityValidationResult,
  OtpRecord,
  OtpSession,
  OtpPurpose,
  OtpVerificationResult,
  PasswordValidationResult,
} from '#/business/identity/types'

export interface IIdentityGenerator {
  generateIdentity: (input: GenerateIdentityInput) => GeneratedIdentity
  generateUsername: (seed?: string) => string
  validateUsername: (username: string) => boolean
  validatePhone: (phone: string) => boolean
}

export interface IIdentityValidator {
  validateNewIdentity: (input: CreateIdentityInput) => IdentityValidationResult
}

export interface IPasswordPolicy {
  validate: (password: string) => PasswordValidationResult
  hash: (password: string) => string
  canReset: (password: string) => boolean
}

export interface IOtpManager {
  generate: (channel: 'sms' | 'email', destination: string, ttlSeconds?: number) => OtpRecord
  send: (otp: OtpRecord) => { delivered: boolean; provider: 'stub' }
  verify: (otpId: string, code: string) => OtpVerificationResult
  expire: (otpId: string) => boolean
}

export interface IIdentityService {
  register: (input: CreateIdentityInput) => UserIdentity
  authenticate: (identifier: string, password: string) => AuthResult
  requestPasswordReset: (identifier: string) => { ticketId: string }
  resetPassword: (ticketId: string, newPassword: string) => void
}

export interface IOtpProvider {
  readonly name: OtpProviderName
  send: (input: { phone: string; message: string }) => { accepted: boolean; provider: OtpProviderName; referenceId: string }
}

export interface IOtpStorage {
  create: (session: OtpSession) => OtpSession
  findById: (sessionId: string) => OtpSession | undefined
  update: (sessionId: string, updates: Partial<OtpSession>) => OtpSession | undefined
}

export interface IOtpValidator {
  validatePhone: (phone: string) => boolean
  validateCode: (code: string) => boolean
  hashCode: (sessionId: string, code: string) => string
}

export interface IOtpEngine {
  requestOtp: (phone: string, purpose: OtpPurpose, provider?: OtpProviderName) => OtpChallenge
  verifyOtp: (sessionId: string, code: string) => OtpVerificationResult
  expireOtp: (sessionId: string) => boolean
  getSession: (sessionId: string) => OtpSession | undefined
}
