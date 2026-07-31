import type { IPasswordPolicy } from '#/business/identity/interfaces'
import type { PasswordStrength, PasswordValidationResult } from '#/business/identity/types'

function scorePassword(password: string): number {
  let score = 0
  if (password.length >= 12) score += 2
  else if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  return score
}

function resolveStrength(score: number): PasswordStrength {
  if (score >= 5) return 'strong'
  if (score >= 3) return 'medium'
  return 'weak'
}

export class PasswordPolicy implements IPasswordPolicy {
  constructor(private readonly minimumLength = 8) {}

  validate(password: string): PasswordValidationResult {
    const errors: string[] = []

    if (password.length < this.minimumLength) {
      errors.push(`Password must contain at least ${this.minimumLength} characters.`)
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.')
    }

    const strength = resolveStrength(scorePassword(password))
    return {
      valid: errors.length === 0,
      errors,
      strength,
    }
  }

  hash(password: string): string {
    // Stub hash implementation for business engine abstraction.
    return `stub-hash:${password.length}:${password.charCodeAt(0) || 0}`
  }

  canReset(password: string): boolean {
    return this.validate(password).valid
  }
}
