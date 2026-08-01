export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'system' | 'wallet' | 'credits' | 'subscription' | 'payment' | 'generation'
export type NotificationPriority = 'low' | 'medium' | 'high'

export type NotificationItem = {
  id: string
  title: string
  message: string
  level: NotificationLevel
  priority: NotificationPriority
  createdAt: string
  category: NotificationCategory
  read: boolean
  channels?: Array<'email' | 'sms' | 'whatsapp'>
}

export type NotificationListener = (items: NotificationItem[]) => void

const STORAGE_KEY = 'srg.workspace.notifications.v1'

const defaultNotifications = (): NotificationItem[] => [
  {
    id: 'notif-system-1',
    title: 'Workspace pret',
    message: 'Le workspace SRG est pret pour les projets, prompts et generations.',
    level: 'success',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    category: 'system',
    read: false,
    channels: ['email'],
  },
  {
    id: 'notif-generation-1',
    title: 'Generation terminee',
    message: 'Votre derniere generation est disponible dans History.',
    level: 'info',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    category: 'generation',
    read: false,
    channels: ['email', 'whatsapp'],
  },
  {
    id: 'notif-wallet-1',
    title: 'Wallet mis a jour',
    message: 'Une operation recente a modifie votre balance wallet.',
    level: 'warning',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    category: 'wallet',
    read: true,
    channels: ['sms'],
  },
]

export class NotificationService {
  private listeners = new Set<NotificationListener>()
  private items: NotificationItem[] = this.readStorage()

  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener)
    listener(this.items)
    return () => {
      this.listeners.delete(listener)
    }
  }

  publish(notification: Omit<NotificationItem, 'id' | 'createdAt'>) {
    const item: NotificationItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...notification,
    }
    this.items = [item, ...this.items]
    this.emit()
  }

  dismiss(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
    this.emit()
  }

  clear() {
    this.items = []
    this.emit()
  }

  markRead(id: string) {
    this.items = this.items.map((item) => (item.id === id ? { ...item, read: true } : item))
    this.emit()
  }

  markAllRead() {
    this.items = this.items.map((item) => ({ ...item, read: true }))
    this.emit()
  }

  replace(items: NotificationItem[]) {
    this.items = items
    this.emit()
  }

  private emit() {
    this.persist()
    this.listeners.forEach((listener) => listener(this.items))
  }

  list() {
    return [...this.items]
  }

  private readStorage(): NotificationItem[] {
    if (typeof window === 'undefined') {
      return defaultNotifications()
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const next = defaultNotifications()
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      }

      const parsed = JSON.parse(raw) as NotificationItem[]
      return Array.isArray(parsed) ? parsed : defaultNotifications()
    } catch {
      return defaultNotifications()
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    }
  }
}

export const notificationService = new NotificationService()
