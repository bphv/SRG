export type DeviceInfo = {
  deviceId: string
  deviceName: string
  browser: string
  os: string
  ipAddress: string
  lastSeen: string
  currentDevice: boolean
  trustedDevice: boolean
}

export type DeviceSession = {
  sessionId: string
  userId: string
  token: string
  createdAt: string
  expiresAt: string
  lastActivityAt: string
  active: boolean
  rememberMe: boolean
  device: DeviceInfo
}

export type DeviceHistory = {
  userId: string
  sessions: DeviceSession[]
}

export type SecurityEventType =
  | 'login'
  | 'logout'
  | 'failed-login'
  | 'password-reset'
  | 'otp-request'
  | 'otp-validation'
  | 'session-expired'
  | 'logout-all-devices'
  | 'device-revoked'

export type SecurityEvent = {
  id: string
  at: string
  userId?: string
  type: SecurityEventType
  status: 'success' | 'failed'
  message: string
  metadata?: Record<string, unknown>
}
