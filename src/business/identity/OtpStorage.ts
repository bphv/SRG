import type { IOtpStorage } from '#/business/identity/interfaces'
import type { OtpSession } from '#/business/identity/types'

export class OtpStorage implements IOtpStorage {
  private readonly sessions = new Map<string, OtpSession>()

  create(session: OtpSession): OtpSession {
    this.sessions.set(session.id, session)
    return session
  }

  findById(sessionId: string): OtpSession | undefined {
    return this.sessions.get(sessionId)
  }

  update(sessionId: string, updates: Partial<OtpSession>): OtpSession | undefined {
    const current = this.sessions.get(sessionId)
    if (!current) {
      return undefined
    }

    const next = { ...current, ...updates }
    this.sessions.set(sessionId, next)
    return next
  }
}
