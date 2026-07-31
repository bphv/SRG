import type { BusinessSession, LoginSessionOptions, SessionHistoryEntry } from '#/business/orchestrator/types'

function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

const STANDARD_TTL_MS = 60 * 60 * 1000
const REMEMBER_ME_TTL_MS = 30 * 24 * 60 * 60 * 1000

export class SessionManager {
  private readonly sessions = new Map<string, BusinessSession>()

  create(userId: string, options: LoginSessionOptions = {}): BusinessSession {
    const now = Date.now()
    const rememberMe = options.rememberMe === true
    const ttl = rememberMe ? REMEMBER_ME_TTL_MS : STANDARD_TTL_MS

    const session: BusinessSession = {
      id: randomId('sess'),
      userId,
      token: randomId('token'),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttl).toISOString(),
      active: true,
      rememberMe,
      deviceId: randomId('dev'),
      deviceName: options.device?.deviceName ?? 'Unknown device',
      userAgent: options.device?.userAgent,
      ipAddress: options.device?.ipAddress,
      lastActivityAt: new Date(now).toISOString(),
    }

    this.sessions.set(session.id, session)
    return session
  }

  get(sessionId: string): BusinessSession | undefined {
    return this.sessions.get(sessionId)
  }

  refresh(sessionId: string): BusinessSession | undefined {
    const session = this.sessions.get(sessionId)
    if (!session || !session.active) {
      return undefined
    }

    const now = Date.now()
    const ttl = session.rememberMe ? REMEMBER_ME_TTL_MS : STANDARD_TTL_MS
    const next: BusinessSession = {
      ...session,
      token: randomId('token'),
      expiresAt: new Date(now + ttl).toISOString(),
      lastActivityAt: new Date(now).toISOString(),
    }

    this.sessions.set(sessionId, next)
    return next
  }

  validate(sessionId: string): { valid: boolean; session?: BusinessSession; reason?: 'not_found' | 'expired' | 'inactive' } {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { valid: false, reason: 'not_found' }
    }

    if (!session.active) {
      return { valid: false, reason: 'inactive' }
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.set(sessionId, { ...session, active: false })
      return { valid: false, reason: 'expired' }
    }

    return { valid: true, session }
  }

  logout(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    this.sessions.set(sessionId, {
      ...session,
      active: false,
      lastActivityAt: new Date().toISOString(),
    })

    return true
  }

  logoutAllDevices(userId: string, exceptSessionId?: string): number {
    let count = 0
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId !== userId || !session.active || sessionId === exceptSessionId) {
        continue
      }

      this.sessions.set(sessionId, {
        ...session,
        active: false,
        lastActivityAt: new Date().toISOString(),
      })
      count += 1
    }

    return count
  }

  history(userId: string): SessionHistoryEntry[] {
    const entries: SessionHistoryEntry[] = []

    for (const session of this.sessions.values()) {
      if (session.userId !== userId) {
        continue
      }

      entries.push({
        sessionId: session.id,
        userId: session.userId,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt ?? session.createdAt,
        expiresAt: session.expiresAt,
        active: session.active,
        rememberMe: session.rememberMe === true,
        deviceName: session.deviceName ?? 'Unknown device',
        userAgent: session.userAgent,
        ipAddress: session.ipAddress,
      })
    }

    return entries.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  }
}
