import type { VariableDefinition } from './VariableDefinition'

/**
 * VariableResolver: resolve variable values for prompts (stubs).
 */
export class VariableResolver {
  async resolve(_def: VariableDefinition): Promise<unknown> {
    return undefined
  }
}
