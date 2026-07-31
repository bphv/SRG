import type { VariableDefinition } from '#/prompt/variables/VariableDefinition'

export interface IVariableResolver {
  resolve: (def: VariableDefinition) => Promise<unknown>
}
