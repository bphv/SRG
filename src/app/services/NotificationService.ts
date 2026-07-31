export type NotificationLevel = 'info' | 'success' | 'warning' | 'error'

export type NotificationItem = {
  id: string
  title: string
  message: string
  level: NotificationLevel
  createdAt: string
}

export type NotificationListener = (items: NotificationItem[]) => void

export class NotificationService {
  private listeners = new Set<NotificationListener>()
  private items: NotificationItem[] = []

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
}

export const notificationService = new NotificationService()
