import type { BootstrapStage } from './BootstrapStage'
import type { BootstrapContext } from './BootstrapContext'
import type { BootstrapResult } from './BootstrapResult'

/**
 * BootstrapPipeline: representation of a bootstrap step handler.
 */
export interface BootstrapStep {
  stage: BootstrapStage
  run: (context: BootstrapContext) => Promise<BootstrapResult>
}

export class BootstrapPipeline {
  private readonly steps: BootstrapStep[] = []

  addStep(step: BootstrapStep): void {
    this.steps.push(step)
  }

  async run(context: BootstrapContext): Promise<BootstrapResult[]> {
    const results: BootstrapResult[] = []
    for (const step of this.steps) {
      // Each step is responsible for its own implementation (stub for now)
      // We still call it to keep structure valid.
       
      const res = await step.run(context)
      results.push(res)
    }
    return results
  }
}
