import type { NotificationItem } from '#/app/services/NotificationService'

function formatChannelList(channels: NotificationItem['channels']): string {
  if (!channels || channels.length === 0) {
    return 'In-app only'
  }

  return channels.join(', ')
}

export default function NotificationCenter({
  notifications,
  onClose,
  onDismiss,
  onClear,
  onMarkRead,
  onMarkAllRead,
}: {
  notifications: NotificationItem[]
  onClose: () => void
  onDismiss: (id: string) => void
  onClear: () => void
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}) {
  const unreadCount = notifications.filter((item) => !item.read).length

  return (
    <div
      className="w-full max-w-md rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_24px_50px_rgba(13,30,14,0.26)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Notifications</p>
          <h2 id="notification-center-title" className="mt-2 text-2xl font-semibold text-[var(--sea-ink)]">
            Centre de notifications
          </h2>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">{unreadCount} non lue(s) • Email, SMS et WhatsApp prepares.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)]"
          aria-label="Fermer le centre de notifications"
        >
          Fermer
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)]"
        >
          Tout marquer comme lu
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-[rgba(223,78,78,0.24)] bg-[rgba(223,78,78,0.08)] px-3 py-2 text-xs font-semibold text-[#9b2f2f]"
        >
          Tout effacer
        </button>
      </div>

      <div className="mt-4 max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
            Aucune notification disponible.
          </div>
        ) : null}

        {notifications.map((item) => (
          <article
            key={item.id}
            className={`rounded-3xl border p-4 text-sm ${item.read ? 'border-[var(--line)] bg-[var(--surface-strong)]' : 'border-[var(--lagoon)] bg-[var(--surface)]'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--sea-ink)]">{item.title}</p>
                <p className="mt-1 text-[var(--sea-ink-soft)]">{item.message}</p>
              </div>
              <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--lagoon-deep)]">
                {item.category}
              </span>
            </div>
            <p className="mt-3 text-xs text-[var(--sea-ink-soft)]">
              {new Date(item.createdAt).toLocaleString()} • Channels: {formatChannelList(item.channels)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!item.read ? (
                <button
                  type="button"
                  onClick={() => onMarkRead(item.id)}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)]"
                >
                  Marquer lu
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--sea-ink)]"
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}