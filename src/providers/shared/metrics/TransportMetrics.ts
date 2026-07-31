export class TransportMetrics {
  private _requests = 0
  private _failures = 0
  private _totalLatency = 0
  private _lastLatency = 0
  private readonly startTime = Date.now()

  get requests(): number {
    return this._requests
  }

  get failures(): number {
    return this._failures
  }

  get averageLatency(): number {
    return this._requests === 0 ? 0 : this._totalLatency / this._requests
  }

  get lastLatency(): number {
    return this._lastLatency
  }

  get uptime(): number {
    return Date.now() - this.startTime
  }

  recordRequest(latency: number): void {
    this._requests += 1
    this._lastLatency = latency
    this._totalLatency += latency
  }

  recordFailure(): void {
    this._failures += 1
  }

  reset(): void {
    this._requests = 0
    this._failures = 0
    this._totalLatency = 0
    this._lastLatency = 0
  }
}
