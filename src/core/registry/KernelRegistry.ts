import { AgentRegistry } from './AgentRegistry'
import { DomainRegistry } from './DomainRegistry'
import { KnowledgeRegistry } from './KnowledgeRegistry'
import { ModuleRegistry } from './ModuleRegistry'
import { PromptRegistry } from './PromptRegistry'
import { ServiceRegistry } from './ServiceRegistry'

export interface KernelRegistry {
  readonly modules: ModuleRegistry
  readonly services: ServiceRegistry
  readonly agents: AgentRegistry
  readonly prompts: PromptRegistry
  readonly knowledge: KnowledgeRegistry
  readonly domains: DomainRegistry
}

export class KernelRegistryImpl implements KernelRegistry {
  public readonly modules = new ModuleRegistry()
  public readonly services = new ServiceRegistry()
  public readonly agents = new AgentRegistry()
  public readonly prompts = new PromptRegistry()
  public readonly knowledge = new KnowledgeRegistry()
  public readonly domains = new DomainRegistry()
}
