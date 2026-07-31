export interface RetryStrategy {
  nextDelay: (attempt: number) => number
}

export class FixedDelayStrategy implements RetryStrategy {
  constructor(private readonly delayMs: number = 100) {}

  nextDelay(_: number): number {
    return this.delayMs
  }
}
