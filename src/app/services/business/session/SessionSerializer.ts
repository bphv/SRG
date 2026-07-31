import type { DeviceSession, SecurityEvent } from '#/app/services/business/session/types'

export class SessionSerializer {
  serializeSessions(sessions: DeviceSession[]): string {
    return JSON.stringify(sessions)
  }

  deserializeSessions(payload: string | null): DeviceSession[] {
    if (!payload) {
      return []
    }

    try {
      const parsed = JSON.parse(payload) as DeviceSession[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  serializeEvents(events: SecurityEvent[]): string {
    return JSON.stringify(events)
  }

  deserializeEvents(payload: string | null): SecurityEvent[] {
    if (!payload) {
      return []
    }

    try {
      const parsed = JSON.parse(payload) as SecurityEvent[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
}
