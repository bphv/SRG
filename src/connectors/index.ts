/**
 * Connectors module placeholder.
 * Future implementation will integrate external systems and adapters.
 */
export interface Connector {
  id: string
  connect(): Promise<void>
  disconnect(): Promise<void>
}

export class ConnectorManager {
  private readonly connectors = new Map<string, Connector>()

  register(connector: Connector): void {
    this.connectors.set(connector.id, connector)
  }

  getConnector(id: string): Connector | undefined {
    return this.connectors.get(id)
  }
}
