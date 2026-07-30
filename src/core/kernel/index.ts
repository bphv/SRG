import type { KernelOptions } from '#/types'
import { ConfigManager } from '../config'
import { ConsoleLogger } from '../logger'
import { EventBusImpl } from '../events'
import { KernelRegistryImpl } from '../registry'

export interface Kernel {
  start(): Promise<void>
  stop(): Promise<void>
  readonly name: string
  readonly environment: string
  readonly config: ConfigManager
  readonly logger: ConsoleLogger
  readonly registry: KernelRegistryImpl
  readonly events: EventBusImpl
}

export function createKernel(options: KernelOptions = {}): Kernel {
  const env = options.env ?? 'development'
  const kernelName = options.name ?? 'SRG Kernel'

  return {
    name: kernelName,
    environment: env,
    config: new ConfigManager(),
    logger: new ConsoleLogger(kernelName),
    registry: new KernelRegistryImpl(),
    events: new EventBusImpl(),
    async start() {
      this.logger.info(`Starting kernel: ${this.name} (${this.environment})`)
    },
    async stop() {
      this.logger.info(`Stopping kernel: ${this.name}`)
    },
  }
}
