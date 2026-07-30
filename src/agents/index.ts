/**
 * Agents module placeholder.
 * Future implementation will manage AI agents and their orchestration.
 */
export interface Agent {
  id: string
  run(payload: unknown): Promise<unknown>
}

export class AgentManager {
  private readonly agents = new Map<string, Agent>()

  register(agent: Agent): void {
    this.agents.set(agent.id, agent)
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id)
  }
}
