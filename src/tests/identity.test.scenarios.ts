import { IdentityEngine } from '#/business/identity'

export type IdentityTestScenario = {
  id: string
  title: string
  given: string
  when: string
  then: string
}

export const identityTestScenarios: IdentityTestScenario[] = [
  {
    id: 'identity-register-001',
    title: 'Registration validates required phone and password policy',
    given: 'A registration payload with missing phone or weak password',
    when: 'validateRegistration is executed',
    then: 'Validation should fail with explicit errors',
  },
  {
    id: 'identity-register-002',
    title: 'Registration creates UUID and SRG matricule',
    given: 'A valid registration payload',
    when: 'register is executed',
    then: 'The user should have id, matricule, username, wallet, credits, and default plan',
  },
  {
    id: 'identity-auth-001',
    title: 'Authentication supports username and matricule',
    given: 'A valid account with known password',
    when: 'authenticate is called with username and with matricule',
    then: 'Both authentication attempts should succeed',
  },
]

export function runIdentitySelfCheck(): { ok: boolean; details: string[] } {
  const identity = new IdentityEngine()
  const details: string[] = []

  const preview = identity.generateIdentity({
    phone: '+33600000000',
    firstName: 'Self',
    lastName: 'Check',
  })

  details.push(`Generated username: ${preview.username}`)
  details.push(`Generated matricule: ${preview.matricule}`)

  return {
    ok: preview.matricule.startsWith('SRG') && preview.username.length > 0,
    details,
  }
}
