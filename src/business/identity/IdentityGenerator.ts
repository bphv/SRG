import type { IIdentityGenerator } from '#/business/identity/interfaces'
import type { GenerateIdentityInput, GeneratedIdentity } from '#/business/identity/types'
import { UsernameValidator } from '#/business/identity/UsernameValidator'
import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6)
}

export class IdentityGenerator implements IIdentityGenerator {
  private readonly sequenceByDay: Record<string, number> = {}
  private readonly issuedMatricules = new Set<string>()

  generateIdentity(input: GenerateIdentityInput): GeneratedIdentity {
    const createdAt = input.createdAt ?? new Date()
    const day = dateKey(createdAt)
    const existing = new Set(BusinessFoundationService.getSnapshot().users.map((user) => user.matricule))

    let matricule = ''
    while (!matricule) {
      const next = (this.sequenceByDay[day] ?? 0) + 1
      this.sequenceByDay[day] = next
      const candidate = `SRG${day}-${String(next).padStart(6, '0')}`
      if (!existing.has(candidate) && !this.issuedMatricules.has(candidate)) {
        this.issuedMatricules.add(candidate)
        matricule = candidate
      }
    }

    const usernameSeed = input.usernameBase ?? `${input.firstName ?? ''}.${input.lastName ?? ''}`
    const username = this.generateUsername(usernameSeed)

    return {
      id: crypto.randomUUID(),
      matricule,
      username,
    }
  }

  generateUsername(seed?: string): string {
    const base = UsernameValidator.normalize(seed && seed.trim() ? seed : `user-${randomSuffix()}`)
    let candidate = base
    let sequence = 0
    const users = BusinessFoundationService.getSnapshot().users
    const isTaken = (value: string) => users.some((user) => user.username.toLowerCase() === value.toLowerCase())

    while (!this.validateUsername(candidate) || isTaken(candidate)) {
      sequence += 1
      candidate = `${base}-${sequence}`
    }

    return candidate
  }

  validateUsername(username: string): boolean {
    return UsernameValidator.isValid(username)
  }

  validatePhone(phone: string): boolean {
    const normalized = phone.trim()
    return /^\+?[1-9]\d{6,14}$/.test(normalized)
  }
}
