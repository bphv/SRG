import React, { createContext, useContext, useEffect, useState } from 'react'
import { notificationService  } from '#/app/services/NotificationService'
import type {NotificationItem} from '#/app/services/NotificationService';

type NotificationContextValue = {
  notifications: NotificationItem[]
  publish: (notification: Omit<NotificationItem, 'id' | 'createdAt'>) => void
  dismiss: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    return notificationService.subscribe(setNotifications)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        publish: notificationService.publish.bind(notificationService),
        dismiss: notificationService.dismiss.bind(notificationService),
        clear: notificationService.clear.bind(notificationService),
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used inside NotificationProvider')
  }
  return context
}
