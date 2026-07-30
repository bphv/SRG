import { BaseRegistry } from './RegistryTypes'
import type { RegistryEntry } from './RegistryTypes'

export interface KnowledgeEntry extends RegistryEntry {
  source: string
  metadata?: Record<string, unknown>
}

export class KnowledgeRegistry extends BaseRegistry<KnowledgeEntry> {}
