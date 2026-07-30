/**
 * CLI module placeholder.
 * Future development will expose command line tools for SRG.
 */
export interface CliCommand {
  name: string
  description: string
  execute(args: string[]): Promise<number>
}

export class CliManager {
  private readonly commands = new Map<string, CliCommand>()

  register(command: CliCommand): void {
    this.commands.set(command.name, command)
  }

  getCommand(name: string): CliCommand | undefined {
    return this.commands.get(name)
  }
}
