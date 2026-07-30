/**
 * VariableDefinition: metadata for a template variable.
 */
export interface VariableDefinition {
  name: string
  type?: string
  required?: boolean
  defaultValue?: unknown
  description?: string
}
