import { describe, expect, it } from 'vitest'

import { BusinessFoundationService } from '#/app/services/business/BusinessFoundationService'

function uniqueTag() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function matriculeSequence(matricule: string): number {
  const match = /^SRG\d{8}-(\d{6})$/.exec(matricule)
  if (!match) {
    throw new Error(`Invalid matricule format: ${matricule}`)
  }
  return Number(match[1])
}

describe('SRG auth contract', () => {
  it('creates canonical matricules with daily sequence', () => {
    const tag = uniqueTag()

    const first = BusinessFoundationService.createUser({
      username: `auth-user-a-${tag}`,
      phone: `+3369${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `auth-a-${tag}@example.test`,
      password: 'Srg@2026!Temp',
      role: 'User',
      profile: {
        firstName: 'Auth',
        lastName: 'A',
        country: 'France',
        city: 'Paris',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    const second = BusinessFoundationService.createUser({
      username: `auth-user-b-${tag}`,
      phone: `+3368${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `auth-b-${tag}@example.test`,
      password: 'Srg@2026!Temp',
      role: 'User',
      profile: {
        firstName: 'Auth',
        lastName: 'B',
        country: 'France',
        city: 'Lyon',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    expect(first.matricule).toMatch(/^SRG\d{8}-\d{6}$/)
    expect(second.matricule).toMatch(/^SRG\d{8}-\d{6}$/)
    expect(matriculeSequence(second.matricule)).toBeGreaterThan(matriculeSequence(first.matricule))
  })

  it('authenticates with username and tolerant matricule input variants', () => {
    const tag = uniqueTag()
    const password = 'Srg@2026!Temp'

    const user = BusinessFoundationService.createUser({
      username: `auth-login-${tag}`,
      phone: `+3377${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `auth-login-${tag}@example.test`,
      password,
      role: 'User',
      profile: {
        firstName: 'Login',
        lastName: 'User',
        country: 'France',
        city: 'Marseille',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    const canonical = user.matricule
    const seq = String(matriculeSequence(canonical))
    const date = canonical.slice(3, 11)
    const shortVariant = `SRG${date}-${seq}`
    const oneZeroVariant = `SRG${date}-${seq.padStart(2, '0')}`

    expect(BusinessFoundationService.authenticate(user.username, password).success).toBe(true)
    expect(BusinessFoundationService.authenticate(canonical, password).success).toBe(true)
    expect(BusinessFoundationService.authenticate(shortVariant, password).success).toBe(true)
    expect(BusinessFoundationService.authenticate(oneZeroVariant, password).success).toBe(true)
  })

  it('rejects duplicate email at domain level and keeps matricule normalization strict', () => {
    const tag = uniqueTag()
    const duplicateEmail = `auth-dup-${tag}@example.test`

    BusinessFoundationService.createUser({
      username: `auth-dup-a-${tag}`,
      phone: `+3355${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: duplicateEmail,
      password: 'Srg@2026!Temp',
      role: 'User',
      profile: {
        firstName: 'Dup',
        lastName: 'Alpha',
        country: 'France',
        city: 'Nantes',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    expect(() =>
      BusinessFoundationService.createUser({
        username: `auth-dup-b-${tag}`,
        phone: `+3356${Math.floor(1000000 + Math.random() * 8999999)}`,
        email: duplicateEmail,
        password: 'Srg@2026!Temp',
        role: 'User',
        profile: {
          firstName: 'Dup',
          lastName: 'Beta',
          country: 'France',
          city: 'Lille',
          preferredLanguage: 'Français',
          timezone: 'Europe/Paris',
        },
      }),
    ).toThrowError('Email already exists.')

    expect(BusinessFoundationService.normalizeMatriculeInput('SRG20260731-000001')).toBe('SRG20260731-000001')
    expect(BusinessFoundationService.normalizeMatriculeInput('SRG20260731-1')).toBe('SRG20260731-000001')
    expect(BusinessFoundationService.normalizeMatriculeInput('SRG20260731-01')).toBe('SRG20260731-000001')
    expect(BusinessFoundationService.normalizeMatriculeInput('SRG20260731-000000')).toBeUndefined()
    expect(BusinessFoundationService.normalizeMatriculeInput('BAD20260731-1')).toBeUndefined()
  })

  it('creates pending accounts and blocks protected access until admin approval', () => {
    const tag = uniqueTag()
    const pendingUser = BusinessFoundationService.createUser({
      username: `pending-user-${tag}`,
      phone: `+3344${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `pending-${tag}@example.test`,
      password: 'Srg@2026!Temp',
      role: 'User',
      accountStatus: 'PENDING_APPROVAL',
      profile: {
        firstName: 'Pending',
        lastName: 'User',
        country: 'France',
        city: 'Bordeaux',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    const accessBefore = BusinessFoundationService.getAccountAccess(pendingUser.id)
    expect(accessBefore.allowed).toBe(false)
    expect(accessBefore.status).toBe('PENDING_APPROVAL')
    expect(() => BusinessFoundationService.requireApprovedAccount(pendingUser.id)).toThrowError(
      'ACCOUNT_PENDING_APPROVAL',
    )

    const admin = BusinessFoundationService.getSnapshot().users.find(
      (user) => user.role === 'SuperAdmin' || user.role === 'Admin',
    )
    if (!admin) {
      throw new Error('Missing seeded administrator for approval test.')
    }

    const approved = BusinessFoundationService.approveUser(pendingUser.id, admin.id)
    expect(approved.accountStatus).toBe('APPROVED')
    expect(BusinessFoundationService.getAccountAccess(pendingUser.id).allowed).toBe(true)
    expect(() => BusinessFoundationService.requireApprovedAccount(pendingUser.id)).not.toThrow()
  })

  it('restricts account status transitions to administrators only', () => {
    const tag = uniqueTag()

    const targetUser = BusinessFoundationService.createUser({
      username: `approval-target-${tag}`,
      phone: `+3333${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `approval-target-${tag}@example.test`,
      password: 'Srg@2026!Temp',
      role: 'User',
      accountStatus: 'PENDING_APPROVAL',
      profile: {
        firstName: 'Target',
        lastName: 'Account',
        country: 'France',
        city: 'Nice',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    const nonAdmin = BusinessFoundationService.createUser({
      username: `approval-actor-${tag}`,
      phone: `+3322${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: `approval-actor-${tag}@example.test`,
      password: 'Srg@2026!Temp',
      role: 'User',
      profile: {
        firstName: 'Actor',
        lastName: 'NonAdmin',
        country: 'France',
        city: 'Rouen',
        preferredLanguage: 'Français',
        timezone: 'Europe/Paris',
      },
    })

    expect(() => BusinessFoundationService.rejectUser(targetUser.id, nonAdmin.id, 'not-authorized')).toThrowError(
      'Only administrators can update account status.',
    )
  })
})