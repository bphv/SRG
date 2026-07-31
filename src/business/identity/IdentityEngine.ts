import type { AuthResult, UserIdentity } from '#/app/services/business/BusinessFoundationService'
import type { CreateIdentityInput, GenerateIdentityInput, GeneratedIdentity, IdentityValidationResult } from '#/business/identity/types'
import { IdentityGenerator } from '#/business/identity/IdentityGenerator'
import { IdentityService } from '#/business/identity/IdentityService'
import { OtpEngine } from '#/business/identity/OtpEngine'
import { IdentityValidator } from '#/business/identity/IdentityValidator'
import { OtpManager } from '#/business/identity/OtpManager'
import { PasswordPolicy } from '#/business/identity/PasswordPolicy'

export class IdentityEngine {
  readonly generator: IdentityGenerator
  readonly validator: IdentityValidator
  readonly passwordPolicy: PasswordPolicy
  readonly otpManager: OtpManager
  readonly otpEngine: OtpEngine
  readonly service: IdentityService

  constructor() {
    this.generator = new IdentityGenerator()
    this.passwordPolicy = new PasswordPolicy()
    this.validator = new IdentityValidator(this.passwordPolicy)
    this.otpManager = new OtpManager()
    this.otpEngine = new OtpEngine()
    this.service = new IdentityService(this.generator, this.validator)
  }

  generateIdentity(input: GenerateIdentityInput): GeneratedIdentity {
    return this.generator.generateIdentity(input)
  }

  generateUsername(seed?: string): string {
    return this.generator.generateUsername(seed)
  }

  validateUsername(username: string): boolean {
    return this.generator.validateUsername(username)
  }

  validatePhone(phone: string): boolean {
    return this.generator.validatePhone(phone)
  }

  validateRegistration(input: CreateIdentityInput): IdentityValidationResult {
    return this.validator.validateNewIdentity(input)
  }

  register(input: CreateIdentityInput): UserIdentity {
    return this.service.register(input)
  }

  authenticate(identifier: string, password: string): AuthResult {
    return this.service.authenticate(identifier, password)
  }
}
