import { BusinessFoundationService   } from '#/app/services/business/BusinessFoundationService'
import type {AuthResult, UserIdentity} from '#/app/services/business/BusinessFoundationService';
import type { IIdentityService } from '#/business/identity/interfaces'
import type { CreateIdentityInput, GeneratedIdentity } from '#/business/identity/types'
import { IdentityGenerator } from '#/business/identity/IdentityGenerator'
import { IdentityValidator } from '#/business/identity/IdentityValidator'

export class IdentityService implements IIdentityService {
  constructor(
    private readonly generator = new IdentityGenerator(),
    private readonly validator = new IdentityValidator(),
  ) {}

  previewIdentity(input: { phone: string; email?: string; usernameBase?: string; firstName?: string; lastName?: string }): GeneratedIdentity {
    return this.generator.generateIdentity({
      phone: input.phone,
      email: input.email,
      usernameBase: input.usernameBase,
      firstName: input.firstName,
      lastName: input.lastName,
    })
  }

  register(input: CreateIdentityInput): UserIdentity {
    const validation = this.validator.validateNewIdentity(input)
    if (!validation.valid) {
      throw new Error(validation.errors.join(' '))
    }

    const username = input.username ? input.username.trim() : this.generator.generateUsername(`${input.profile.firstName}.${input.profile.lastName}`)

    return BusinessFoundationService.createUser({
      username,
      phone: input.phone,
      email: input.email,
      password: input.password,
      role: input.role,
      accountStatus: input.accountStatus,
      profile: input.profile,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      teamId: input.teamId,
    })
  }

  authenticate(identifier: string, password: string): AuthResult {
    return BusinessFoundationService.authenticate(identifier, password)
  }

  requestPasswordReset(identifier: string): { ticketId: string } {
    return BusinessFoundationService.requestForgotPassword(identifier)
  }

  resetPassword(ticketId: string, newPassword: string): void {
    BusinessFoundationService.resetPassword(ticketId, newPassword)
  }
}
