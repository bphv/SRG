export class RuntimeMetrics {
  private _startTime = Date.now()
  private _requestCount = 0
  private _failureCount = 0
  private _successCount = 0
  private _totalLatency = 0

  get uptime(): number {
    return Date.now() - this._startTime
  }

  get memoryUsage(): NodeJS.MemoryUsage | Record<string, number> {
    if (typeof process !== 'undefined' && typeof process.memoryUsage === 'function') {
      return process.memoryUsage()
    }

    return {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
    }
  }

  get requestCount(): number {
    return this._requestCount
  }

  get failureCount(): number {
    return this._failureCount
  }

  get successCount(): number {
    return this._successCount
  }

  get averageLatency(): number {
    if (this._requestCount === 0) {
      return 0
    }
    return this._totalLatency / this._requestCount
  }

  recordRequest(latency: number, success: boolean): void {
    this._requestCount += 1
    this._totalLatency += latency
    if (success) {
      this._successCount += 1
    } else {
      this._failureCount += 1
    }
  }

  snapshot(): Record<string, unknown> {
    return {
      uptime: this.uptime,
      memoryUsage: this.memoryUsage,
      requestCount: this.requestCount,
      failureCount: this.failureCount,
      successCount: this.successCount,
      averageLatency: this.averageLatency,
    }
  }
}
