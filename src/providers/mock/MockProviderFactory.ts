import { MockProvider } from '#/providers/mock/MockProvider'
import type { ProviderContract } from '#/contracts/provider/ProviderContract'

export class MockProviderFactory {
  create(contract: ProviderContract): MockProvider {
    return new MockProvider(contract)
  }
}
