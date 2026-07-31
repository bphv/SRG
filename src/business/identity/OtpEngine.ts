import type { IOtpEngine, IOtpProvider } from '#/business/identity/interfaces'
import type { OtpChallenge, OtpProviderName, OtpPurpose, OtpSession, OtpVerificationResult } from '#/business/identity/types'
import { createOtpProviders } from '#/business/identity/OtpProvider'
import { OtpStorage } from '#/business/identity/OtpStorage'
import { OtpValidator } from '#/business/identity/OtpValidator'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function randomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const DEFAULT_PROVIDER: OtpProviderName = 'Twilio'

export class OtpEngine implements IOtpEngine {
  private readonly providers: Record<OtpProviderName, IOtpProvider>
  private readonly storage = new OtpStorage()
  private readonly validator = new OtpValidator()

  constructor() {
    this.providers = createOtpProviders()
  }

  requestOtp(phone: string, purpose: OtpPurpose, provider: OtpProviderName = DEFAULT_PROVIDER): OtpChallenge {
    if (!this.validator.validatePhone(phone)) {
      throw new Error('Invalid phone format for OTP request.')
    }

    const sessionId = randomId('otp-session')
    const code = randomCode()
    const now = Date.now()

    const session: OtpSession = {
      id: sessionId,
      phone,
      purpose,
      provider,
      codeHash: this.validator.hashCode(sessionId, code),
      attempts: 0,
      maxAttempts: 5,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 5 * 60 * 1000).toISOString(),
      status: 'pending',
    }

    this.storage.create(session)
    const sendResult = this.providers[provider].send({
      phone,
      message: `Your SRG verification code is ${code}`,
    })

    if (!sendResult.accepted) {
      throw new Error('OTP provider rejected the request.')
    }

    return {
      sessionId,
      provider,
      destination: phone,
      expiresAt: session.expiresAt,
      sandboxCode: code,
    }
  }

  verifyOtp(sessionId: string, code: string): OtpVerificationResult {
    const session = this.storage.findById(sessionId)
    if (!session) {
      return { success: false, reason: 'not_found' }
    }

    if (session.status === 'verified') {
      return { success: false, reason: 'already_used' }
    }

    if (session.status === 'blocked') {
      return { success: false, reason: 'invalid_code' }
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.storage.update(sessionId, { status: 'expired' })
      return { success: false, reason: 'expired' }
    }

    if (!this.validator.validateCode(code)) {
      return { success: false, reason: 'invalid_code' }
    }

    const expected = this.validator.hashCode(sessionId, code)
    if (expected !== session.codeHash) {
      const attempts = session.attempts + 1
      const status = attempts >= session.maxAttempts ? 'blocked' : session.status
      this.storage.update(sessionId, { attempts, status })
      return { success: false, reason: 'invalid_code' }
    }

    this.storage.update(sessionId, {
      attempts: session.attempts + 1,
      status: 'verified',
      verifiedAt: new Date().toISOString(),
    })

    return { success: true }
  }

  expireOtp(sessionId: string): boolean {
    const current = this.storage.findById(sessionId)
    if (!current) {
      return false
    }

    this.storage.update(sessionId, {
      status: 'expired',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    })
    return true
  }

  getSession(sessionId: string): OtpSession | undefined {
    return this.storage.findById(sessionId)
  }
}
