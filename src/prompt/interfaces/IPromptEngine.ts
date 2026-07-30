export interface IPromptEngine {
  registerTemplate(): Promise<void>
  loadTemplate(): Promise<void>
  build(): Promise<void>
  render(): Promise<string>
}
