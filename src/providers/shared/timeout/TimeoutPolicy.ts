export class TimeoutPolicy {
  private active = false
  private deadline: number | null = null
  readonly timeout: number

  constructor(timeout: number = 0) {
    this.timeout = timeout
  }

  activate(): void {
    if (this.timeout > 0) {
      this.deadline = Date.now() + this.timeout
      this.active = true
    }
  }

  deactivate(): void {
    this.active = false
    this.deadline = null
  }

  cancel(): void {
    this.deactivate()
  }

  expired(): boolean {
    if (!this.active || this.timeout <= 0 || this.deadline === null) {
      return false
    }

    return Date.now() >= this.deadline
  }
}

