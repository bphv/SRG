export class OpenAIClientError extends Error {
  constructor(message: string, public metadata?: Record<string, unknown>) {
    super(message)
    this.name = 'OpenAIClientError'
  }
}

export class ConfigurationError extends OpenAIClientError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'ConfigurationError'
  }
}

export class NetworkError extends OpenAIClientError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends OpenAIClientError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'TimeoutError'
  }
}

export class AuthenticationError extends OpenAIClientError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends OpenAIClientError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata)
    this.name = 'RateLimitError'
  }
}
