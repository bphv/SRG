import type { IOtpProvider } from '#/business/identity/interfaces'
import type { OtpProviderName } from '#/business/identity/types'

function providerReference(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

class StubSmsProvider implements IOtpProvider {
  constructor(readonly name: OtpProviderName, private readonly prefix: string) {}

  send(_input: { phone: string; message: string }): { accepted: boolean; provider: OtpProviderName; referenceId: string } {
    return {
      accepted: true,
      provider: this.name,
      referenceId: providerReference(this.prefix),
    }
  }
}

export function createOtpProviders(): Record<OtpProviderName, IOtpProvider> {
  return {
    Twilio: new StubSmsProvider('Twilio', 'twl'),
    Vonage: new StubSmsProvider('Vonage', 'vng'),
    'Orange SMS': new StubSmsProvider('Orange SMS', 'org'),
    'MTN SMS': new StubSmsProvider('MTN SMS', 'mtn'),
  }
}
