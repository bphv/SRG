export type PasswordPolicyConfig = {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecial: boolean
  maxAgeDays: number
  warningBeforeExpiryDays: number
  historyLimit: number
  temporaryLockoutMinutes: number
}

export type PasswordMetadata = {
  lastChangedAt: string
  expiresAt: string
  history: string[]
}

export type PasswordPolicyCheck = {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  errors: string[]
}

function defaultConfig(): PasswordPolicyConfig {
  return {
    minLength: 10,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    maxAgeDays: 90,
    warningBeforeExpiryDays: 7,
    historyLimit: 5,
    temporaryLockoutMinutes: 15,
  }
}

function weakHash(input: string): string {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `pw-${(hash >>> 0).toString(16)}`
}

function resolveStrength(score: number): 'weak' | 'medium' | 'strong' {
  if (score >= 5) return 'strong'
  if (score >= 3) return 'medium'
  return 'weak'
}

export class PasswordPolicyService {
  constructor(private readonly config: PasswordPolicyConfig = defaultConfig()) {}

  getConfig(): PasswordPolicyConfig {
    return this.config
  }

  validateComplexity(password: string): PasswordPolicyCheck {
    const errors: string[] = []
    let score = 0

    if (password.length >= this.config.minLength) {
      score += 1
    } else {
      errors.push(`Le mot de passe doit contenir au moins ${this.config.minLength} caractères.`)
    }

    if (/[A-Z]/.test(password)) score += 1
    else if (this.config.requireUppercase) errors.push('Au moins une majuscule est requise.')

    if (/[a-z]/.test(password)) score += 1
    else if (this.config.requireLowercase) errors.push('Au moins une minuscule est requise.')

    if (/[0-9]/.test(password)) score += 1
    else if (this.config.requireNumber) errors.push('Au moins un chiffre est requis.')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else if (this.config.requireSpecial) errors.push('Au moins un caractère spécial est requis.')

    return {
      valid: errors.length === 0,
      strength: resolveStrength(score),
      errors,
    }
  }

  isExpired(lastChangedAt: string): boolean {
    const changedAt = new Date(lastChangedAt).getTime()
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000
    return Date.now() - changedAt > maxAgeMs
  }

  computeExpiration(lastChangedAt: string): string {
    const changedAt = new Date(lastChangedAt).getTime()
    const maxAgeMs = this.config.maxAgeDays * 24 * 60 * 60 * 1000
    return new Date(changedAt + maxAgeMs).toISOString()
  }

  shouldWarnBeforeExpiration(expiresAt: string): boolean {
    const expiresInMs = new Date(expiresAt).getTime() - Date.now()
    const warningWindowMs = this.config.warningBeforeExpiryDays * 24 * 60 * 60 * 1000
    return expiresInMs > 0 && expiresInMs <= warningWindowMs
  }

  updateMetadata(password: string, current?: PasswordMetadata): PasswordMetadata {
    const now = new Date().toISOString()
    const hash = weakHash(password)
    const previous = current?.history ?? []

    return {
      lastChangedAt: now,
      expiresAt: this.computeExpiration(now),
      history: [hash, ...previous].slice(0, this.config.historyLimit),
    }
  }

  canReuse(password: string, metadata?: PasswordMetadata): boolean {
    if (!metadata) {
      return true
    }

    const hash = weakHash(password)
    return !metadata.history.includes(hash)
  }

  historyCounter(metadata?: PasswordMetadata): number {
    return metadata?.history.length ?? 0
  }
}
