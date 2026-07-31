import type { UserRole } from '#/app/services/business/BusinessFoundationService'

export type IdentityId = string

export type PasswordStrength = 'weak' | 'medium' | 'strong'

export type IdentityRecord = {
  id: IdentityId
  matricule: string
  username: string
  phone: string
  email?: string
  createdAt: string
}

export type GeneratedIdentity = {
  id: IdentityId
  matricule: string
  username: string
}

export type GenerateIdentityInput = {
  usernameBase?: string
  firstName?: string
  lastName?: string
  phone: string
  email?: string
  createdAt?: Date
}

export type CreateIdentityInput = {
  username?: string
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
}

export type IdentityValidationResult = {
  valid: boolean
  errors: string[]
}

export type PasswordValidationResult = {
  valid: boolean
  errors: string[]
  strength: PasswordStrength
}

export type OtpRecord = {
  id: string
  channel: 'sms' | 'email'
  destination: string
  code: string
  expiresAt: string
  consumedAt?: string
}

export type OtpVerificationResult = {
  success: boolean
  reason?: 'not_found' | 'expired' | 'already_used' | 'invalid_code'
}

export type OtpProviderName = 'Twilio' | 'Vonage' | 'Orange SMS' | 'MTN SMS'

export type OtpPurpose = 'login' | 'password-reset' | 'phone-verification'

export type OtpSessionStatus = 'pending' | 'verified' | 'expired' | 'blocked'

export type OtpSession = {
  id: string
  phone: string
  purpose: OtpPurpose
  provider: OtpProviderName
  codeHash: string
  attempts: number
  maxAttempts: number
  createdAt: string
  expiresAt: string
  verifiedAt?: string
  status: OtpSessionStatus
}

export type OtpChallenge = {
  sessionId: string
  provider: OtpProviderName
  destination: string
  expiresAt: string
  sandboxCode?: string
}
