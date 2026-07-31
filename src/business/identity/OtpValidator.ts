import type { IOtpValidator } from '#/business/identity/interfaces'

function simpleHash(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `otp-${(hash >>> 0).toString(16)}`
}

export class OtpValidator implements IOtpValidator {
  validatePhone(phone: string): boolean {
    return /^\+?[0-9]{8,15}$/.test(phone.trim())
  }

  validateCode(code: string): boolean {
    return /^[0-9]{6}$/.test(code.trim())
  }

  hashCode(sessionId: string, code: string): string {
    return simpleHash(`${sessionId}:${code}`)
  }
}
