import { useNotificationContext } from '#/app/contexts/NotificationContext'

export function useNotifications() {
  return useNotificationContext()
}
