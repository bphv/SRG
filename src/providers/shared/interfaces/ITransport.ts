export interface ITransport<Request, Response> {
  initialize(): Promise<void>
  prepare(): Promise<void>
  send(request: Request): Promise<Response>
  shutdown(): Promise<void>
}
