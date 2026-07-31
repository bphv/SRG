export class TransportError extends Error {
  constructor(message: string, public metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'TransportError'
  }
}

export class TimeoutError extends TransportError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'TimeoutError'
  }
}

export class NetworkError extends TransportError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'NetworkError'
  }
}

export class AuthenticationError extends TransportError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends TransportError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'RateLimitError'
  }
}

export class ConfigurationError extends TransportError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'ConfigurationError'
  }
}
