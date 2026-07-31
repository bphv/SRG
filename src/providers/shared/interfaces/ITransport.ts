export interface ITransport<TRequest, TResponse> {
  initialize: () => Promise<void>
  prepare: () => Promise<void>
  send: (request: TRequest) => Promise<TResponse>
  shutdown: () => Promise<void>
}
