import { useMemo, useState } from 'react'
import EmptyState from '#/app/components/EmptyState'
import SearchBar from '#/app/components/SearchBar'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | NotificationItem['category']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | NotificationItem['priority']>('all')
  const [textQuery, setTextQuery] = useState('')

  const availableCategories = useMemo(
    () => Array.from(new Set(notifications.map((item) => item.category))),
    [notifications],
  )

  const filteredNotifications = useMemo(
    () => notifications.filter((item) => {
      if (statusFilter === 'read' && !item.read) {
        return false
      }
      if (statusFilter === 'unread' && item.read) {
        return false
      }
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false
      }
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
        return false
      }
      if (textQuery.trim()) {
        const query = textQuery.trim().toLowerCase()
        const haystack = `${item.title} ${item.message} ${item.category} ${item.priority}`.toLowerCase()
        if (!haystack.includes(query)) {
          return false
        }
      }
      return true
    }),
    [notifications, statusFilter, categoryFilter, priorityFilter, textQuery],
  )

  return (
    <div
      className="srg-premium-panel w-full max-w-md p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Notifications</p>
          <h2 id="notification-center-title" className="mt-2 text-2xl font-semibold text-[var(--srg-text-title)]">
            Centre de notifications
          </h2>
          <p className="mt-1 text-sm text-[var(--srg-text-muted)]">{unreadCount} non lue(s) • Email, SMS et WhatsApp prepares.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-sm text-[var(--srg-text-title)]"
          aria-label="Fermer le centre de notifications"
        >
          Fermer
        </button>
      </div>

      <div className="mt-4">
        <SearchBar
          placeholder="Search notifications"
          value={textQuery}
          onSearch={(value) => {
            setTextQuery(value)
            WorkspacePreferencesService.pushRecentSearch(value)
          }}
          onValueChange={setTextQuery}
          instant
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | 'read' | 'unread')}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
          aria-label="Filtrer par statut de lecture"
        >
          <option value="all">Tous</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value as 'all' | NotificationItem['category'])}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
          aria-label="Filtrer par catégorie"
        >
          <option value="all">Toutes catégories</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as 'all' | NotificationItem['priority'])}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
          aria-label="Filtrer par priorité"
        >
          <option value="all">Toutes priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
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
          <EmptyState
            eyebrow="Notifications"
            illustration={<span aria-hidden>◌</span>}
            title="Aucune notification"
            description="Les alertes système, wallet et génération apparaîtront ici dès qu’un événement sera publié."
            action={
              <button
                type="button"
                onClick={onClose}
                className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white"
              >
                Revenir au workspace
              </button>
            }
          />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            eyebrow="Notifications"
            illustration={<span aria-hidden>⌕</span>}
            title="Aucun résultat"
            description="Aucune notification ne correspond aux filtres actifs."
            action={
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all')
                  setCategoryFilter('all')
                  setPriorityFilter('all')
                    setTextQuery('')
                }}
                className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-2 text-sm font-semibold text-white"
              >
                Réinitialiser les filtres
              </button>
            }
          />
        ) : null}

        {filteredNotifications.map((item) => (
          <article
            key={item.id}
            className={`srg-premium-card rounded-3xl p-4 text-sm ${item.read ? 'opacity-90' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--srg-text-title)]">{item.title}</p>
                <p className="mt-1 text-[var(--srg-text-muted)]">{item.message}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="srg-badge srg-badge-enterprise text-[10px] uppercase tracking-[0.2em]">
                  {item.category}
                </span>
                <span className={`srg-badge text-[10px] uppercase tracking-[0.18em] ${item.priority === 'high' ? 'srg-badge-danger' : item.priority === 'medium' ? 'srg-badge-warning' : 'srg-badge-success'}`}>
                  {item.priority}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--srg-text-muted)]">
              {new Date(item.createdAt).toLocaleString()} • Channels: {formatChannelList(item.channels)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!item.read ? (
                <button
                  type="button"
                  onClick={() => onMarkRead(item.id)}
                  className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
                >
                  Marquer lu
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onDismiss(item.id)}
                className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 text-xs font-semibold text-[var(--srg-text-title)]"
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