import type { TraceContext } from './TraceContext'

export class TraceSpan {
  private finishedAt: number | null = null
  private statusValue: string | null = null

  constructor(public readonly context: TraceContext) {}

  start(): void {
    this.context.timestamp = new Date().toISOString()
  }

  finish(status: string = 'OK'): void {
    this.finishedAt = Date.now()
    this.statusValue = status
  }

  duration(): number {
    if (this.finishedAt === null) {
      return 0
    }
    return this.finishedAt - new Date(this.context.timestamp).getTime()
  }

  status(): string {
    return this.statusValue ?? 'UNKNOWN'
  }
}
