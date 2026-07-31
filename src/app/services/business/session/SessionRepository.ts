import type { DeviceHistory, DeviceSession, SecurityEvent } from '#/app/services/business/session/types'
import type { SessionStore } from '#/app/services/business/session/SessionStore'
import { SessionSerializer } from '#/app/services/business/session/SessionSerializer'

const SESSIONS_KEY = 'srg.auth.sessions'
const ACTIVE_KEY = 'srg.auth.active.session'
const EVENTS_KEY = 'srg.auth.security.events'

export class SessionRepository {
  constructor(
    private readonly store: SessionStore,
    private readonly serializer = new SessionSerializer(),
  ) {}

  listSessions(): DeviceSession[] {
    return this.serializer.deserializeSessions(this.store.getItem(SESSIONS_KEY))
  }

  saveSession(session: DeviceSession): DeviceSession {
    const sessions = this.listSessions().filter((item) => item.sessionId !== session.sessionId)
    const next = [session, ...sessions].slice(0, 500)
    this.store.setItem(SESSIONS_KEY, this.serializer.serializeSessions(next))
    this.store.setItem(ACTIVE_KEY, session.sessionId)
    return session
  }

  getSession(sessionId: string): DeviceSession | undefined {
    return this.listSessions().find((item) => item.sessionId === sessionId)
  }

  getActiveSession(): DeviceSession | undefined {
    const activeId = this.store.getItem(ACTIVE_KEY)
    if (!activeId) {
      return undefined
    }
    return this.getSession(activeId)
  }

  setActiveSession(sessionId: string): void {
    this.store.setItem(ACTIVE_KEY, sessionId)
  }

  clearActiveSession(): void {
    this.store.removeItem(ACTIVE_KEY)
  }

  touch(sessionId: string): DeviceSession | undefined {
    const session = this.getSession(sessionId)
    if (!session) {
      return undefined
    }

    const next: DeviceSession = {
      ...session,
      lastActivityAt: new Date().toISOString(),
    }

    this.saveSession(next)
    return next
  }

  expireSession(sessionId: string): DeviceSession | undefined {
    const session = this.getSession(sessionId)
    if (!session) {
      return undefined
    }

    const next: DeviceSession = {
      ...session,
      active: false,
      lastActivityAt: new Date().toISOString(),
    }
    this.saveSession(next)
    return next
  }

  logoutAllForUser(userId: string, exceptSessionId?: string): number {
    const sessions = this.listSessions()
    let count = 0

    const next = sessions.map((item) => {
      if (item.userId !== userId || item.sessionId === exceptSessionId || !item.active) {
        return item
      }
      count += 1
      return { ...item, active: false, lastActivityAt: new Date().toISOString() }
    })

    this.store.setItem(SESSIONS_KEY, this.serializer.serializeSessions(next))
    return count
  }

  revokeSessions(sessionIds: string[]): number {
    if (sessionIds.length === 0) {
      return 0
    }

    const selected = new Set(sessionIds)
    let count = 0
    const sessions = this.listSessions()
    const next = sessions.map((item) => {
      if (!selected.has(item.sessionId) || !item.active) {
        return item
      }

      count += 1
      return {
        ...item,
        active: false,
        lastActivityAt: new Date().toISOString(),
      }
    })

    this.store.setItem(SESSIONS_KEY, this.serializer.serializeSessions(next))
    return count
  }

  history(userId: string): DeviceHistory {
    const sessions = this.listSessions().filter((item) => item.userId === userId)
    return {
      userId,
      sessions,
    }
  }

  listSecurityEvents(): SecurityEvent[] {
    return this.serializer.deserializeEvents(this.store.getItem(EVENTS_KEY))
  }

  appendSecurityEvent(event: SecurityEvent): SecurityEvent {
    const events = this.listSecurityEvents()
    const next = [event, ...events].slice(0, 1000)
    this.store.setItem(EVENTS_KEY, this.serializer.serializeEvents(next))
    return event
  }
}
