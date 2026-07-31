export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'
export type NotificationCategory = 'system' | 'wallet' | 'credits' | 'subscription' | 'payment' | 'generation'

export type NotificationItem = {
  id: string
  title: string
  message: string
  level: NotificationLevel
  createdAt: string
  category: NotificationCategory
  read: boolean
  channels?: Array<'email' | 'sms' | 'whatsapp'>
}

export type NotificationListener = (items: NotificationItem[]) => void

export class NotificationService {
  private listeners = new Set<NotificationListener>()
  private items: NotificationItem[] = [
    {
      id: 'notif-system-1',
      title: 'Workspace pret',
      message: 'Le workspace SRG est pret pour les projets, prompts et generations.',
      level: 'success',
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
      createdAt: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      category: 'wallet',
      read: true,
      channels: ['sms'],
    },
  ]

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
    this.listeners.forEach((listener) => listener(this.items))
  }

  dismiss(id: string) {
    this.items = this.items.filter((item) => item.id !== id)
    this.listeners.forEach((listener) => listener(this.items))
  }

  clear() {
    this.items = []
    this.listeners.forEach((listener) => listener(this.items))
  }

  markRead(id: string) {
    this.items = this.items.map((item) => (item.id === id ? { ...item, read: true } : item))
    this.listeners.forEach((listener) => listener(this.items))
  }

  markAllRead() {
    this.items = this.items.map((item) => ({ ...item, read: true }))
    this.listeners.forEach((listener) => listener(this.items))
  }

  list() {
    return [...this.items]
  }
}

export const notificationService = new NotificationService()
