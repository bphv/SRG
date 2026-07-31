export interface RetryStrategy {
  nextDelay: (attempt: number) => number
}

export class ExponentialBackoffStrategy implements RetryStrategy {
  constructor(private readonly baseDelay: number = 100, private readonly maxDelay: number = 10000) {}

  nextDelay(attempt: number): number {
    const delay = Math.min(this.baseDelay * 2 ** (attempt - 1), this.maxDelay)
    return delay
  }
}

export class RetryPolicy {
  readonly maxRetries: number
  readonly strategy: RetryStrategy

  constructor(maxRetries: number = 0, strategy: RetryStrategy = new ExponentialBackoffStrategy()) {
    this.maxRetries = maxRetries
    this.strategy = strategy
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    let attempt = 0
    let lastError: unknown

    while (attempt <= this.maxRetries) {
      attempt += 1

      try {
        return await action()
      } catch (error) {
        lastError = error

        if (attempt > this.maxRetries) {
          break
        }

        const delay = this.strategy.nextDelay(attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}
