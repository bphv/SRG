import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface ServiceEntry extends RegistryEntry {
  implementation: unknown
}

export class ServiceRegistry extends BaseRegistry<ServiceEntry> {}
