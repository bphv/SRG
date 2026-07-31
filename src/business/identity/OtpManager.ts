import type { IOtpManager } from '#/business/identity/interfaces'
import type { OtpRecord, OtpVerificationResult } from '#/business/identity/types'

function randomOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function randomId(): string {
  return `otp-${Math.random().toString(36).slice(2, 10)}`
}

export class OtpManager implements IOtpManager {
  private readonly store = new Map<string, OtpRecord>()

  generate(channel: 'sms' | 'email', destination: string, ttlSeconds = 300): OtpRecord {
    const now = Date.now()
    const otp: OtpRecord = {
      id: randomId(),
      channel,
      destination,
      code: randomOtp(),
      expiresAt: new Date(now + ttlSeconds * 1000).toISOString(),
    }

    this.store.set(otp.id, otp)
    return otp
  }

  send(_otp: OtpRecord): { delivered: boolean; provider: 'stub' } {
    return { delivered: true, provider: 'stub' }
  }

  verify(otpId: string, code: string): OtpVerificationResult {
    const otp = this.store.get(otpId)
    if (!otp) {
      return { success: false, reason: 'not_found' }
    }
    if (otp.consumedAt) {
      return { success: false, reason: 'already_used' }
    }
    if (new Date(otp.expiresAt).getTime() < Date.now()) {
      return { success: false, reason: 'expired' }
    }
    if (otp.code !== code) {
      return { success: false, reason: 'invalid_code' }
    }

    this.store.set(otp.id, { ...otp, consumedAt: new Date().toISOString() })
    return { success: true }
  }

  expire(otpId: string): boolean {
    const otp = this.store.get(otpId)
    if (!otp) return false
    this.store.set(otp.id, { ...otp, expiresAt: new Date(Date.now() - 1000).toISOString() })
    return true
  }
}
