import { Logger } from './Logger'

export class LoggerFactory {
  create(componentName: string): Logger {
    return new Logger(componentName)
  }
}
