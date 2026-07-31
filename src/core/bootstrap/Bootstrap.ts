import type { BootstrapOptions } from './BootstrapOptions'
import { ALL_BOOTSTRAP_STAGES } from './BootstrapStage'
import { BootstrapPipeline } from './BootstrapPipeline'
import type { BootstrapContext } from './BootstrapContext'
import type { BootstrapResult } from './BootstrapResult'

/**
 * Bootstrap: orchestrates the application startup pipeline.
 * This class contains no business logic, only structure.
 */
export class Bootstrap {
  private readonly pipeline = new BootstrapPipeline()

  constructor(_options: BootstrapOptions = {}) {
    // register empty stages (stubs) in order
    for (const stage of ALL_BOOTSTRAP_STAGES) {
      this.pipeline.addStep({
        stage: stage,
        run: async (_context: BootstrapContext) => ({ stage, success: true }),
      })
    }
  }

  async run(context: BootstrapContext): Promise<BootstrapResult[]> {
    return this.pipeline.run(context)
  }
}
