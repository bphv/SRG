import type { IIdentityValidator } from '#/business/identity/interfaces'
import type { CreateIdentityInput, IdentityValidationResult } from '#/business/identity/types'
import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'
import { PasswordPolicy } from '#/business/identity/PasswordPolicy'
import { UsernameValidator } from '#/business/identity/UsernameValidator'

export class IdentityValidator implements IIdentityValidator {
  constructor(private readonly passwordPolicy = new PasswordPolicy()) {}

  validateNewIdentity(input: CreateIdentityInput): IdentityValidationResult {
    const errors: string[] = []

    if (!input.phone.trim()) {
      errors.push('Phone is required.')
    }

    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.push('Email format is invalid.')
    }

    if (input.username && !UsernameValidator.isValid(input.username)) {
      errors.push('Username format is invalid.')
    }

    const snapshot = BusinessFoundationService.getSnapshot()
    if (input.username) {
      const exists = snapshot.users.some((user) => user.username.toLowerCase() === input.username!.toLowerCase())
      if (exists) {
        errors.push('Username already exists.')
      }
    }

    const phoneExists = snapshot.users.some((user) => user.phone.trim() === input.phone.trim())
    if (phoneExists) {
      errors.push('Phone already exists.')
    }

    const passwordValidation = this.passwordPolicy.validate(input.password)
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
