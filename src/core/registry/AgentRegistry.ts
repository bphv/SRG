import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface AgentEntry extends RegistryEntry {
  name: string
  description?: string
}

export class AgentRegistry extends BaseRegistry<AgentEntry> {}
