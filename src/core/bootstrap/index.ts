import { createKernel } from '../kernel'
import type { KernelOptions } from '#/types'

export * from './Bootstrap'
export * from './BootstrapContext'
export * from './BootstrapPipeline'
export * from './BootstrapResult'
export * from './BootstrapStage'
export * from './BootstrapOptions'

/**
 * Kernel bootstrapper.
 * Exposes a single shared kernel instance for the application.
 */
let kernelInstance: ReturnType<typeof createKernel> | null = null

export function bootstrapKernel(options: KernelOptions = {}) {
  if (kernelInstance) {
    return kernelInstance
  }

  const kernel = createKernel(options)
  kernel.start().catch((error) => {
    kernel.logger.error(`Kernel bootstrap failed: ${error}`)
  })

  kernelInstance = kernel
  return kernel
}

export function getKernel() {
  if (!kernelInstance) {
    return bootstrapKernel()
  }

  return kernelInstance
}
