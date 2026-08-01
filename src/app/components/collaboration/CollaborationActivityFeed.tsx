import { useMemo, useState } from 'react'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'

export default function CollaborationActivityFeed() {
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('week')
  const [authorFilter, setAuthorFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const activity = useMemo(() => CollaborationWorkspaceService.getActivity(period), [period])

  const filtered = useMemo(() => {
    return activity.filter((item) => {
      const matchesAuthor = !authorFilter || item.actorName.toLowerCase().includes(authorFilter.toLowerCase())
      const matchesProject = !projectFilter || (item.projectId ?? '').toLowerCase().includes(projectFilter.toLowerCase())
      const matchesType = !typeFilter || item.type.toLowerCase().includes(typeFilter.toLowerCase())
      return matchesAuthor && matchesProject && matchesType
    })
  }, [activity, authorFilter, projectFilter, typeFilter])

  return (
    <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Activity Feed</h3>
        <div className="flex flex-wrap gap-2">
          <select value={period} onChange={(event) => setPeriod(event.target.value as 'today' | 'yesterday' | 'week' | 'month' | 'all')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs">
            <option value="today">Aujourd'hui</option>
            <option value="yesterday">Hier</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="all">Tout</option>
          </select>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportActivity(period, 'json')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs">JSON</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportActivity(period, 'csv')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs">CSV</button>
          <button type="button" onClick={() => CollaborationWorkspaceService.exportActivity(period, 'markdown')} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 text-xs">Markdown</button>
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <input value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} placeholder="Auteur" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm" />
        <input value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} placeholder="Projet" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm" />
        <input value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} placeholder="Type" className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm" />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {filtered.length === 0 ? <p className="text-[var(--srg-text-muted)]">Aucune activité.</p> : filtered.slice(0, 80).map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
            <p className="font-semibold text-[var(--srg-text-title)]">{item.actorName} • {item.type}</p>
            <p className="mt-1 text-[var(--srg-text-muted)]">{item.message}</p>
            <p className="mt-1 text-xs text-[var(--srg-text-muted)]">{new Date(item.createdAt).toLocaleString()} {item.projectId ? `• ${item.projectId}` : ''}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
