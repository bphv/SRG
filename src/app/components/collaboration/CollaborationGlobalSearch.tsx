import { useMemo, useState } from 'react'
import { CollaborationWorkspaceService } from '#/app/services/CollaborationWorkspaceService'

export default function CollaborationGlobalSearch({
  projects,
  prompts,
  templates,
  users,
}: {
  projects: Array<{ id: string; name: string; description: string }>
  prompts: Array<{ id: string; name: string; description: string }>
  templates: Array<{ id: string; name: string; description: string }>
  users: Array<{ id: string; username: string }>
}) {
  const [query, setQuery] = useState('')

  const results = useMemo(
    () =>
      CollaborationWorkspaceService.searchGlobal({
        query,
        projects,
        prompts,
        templates,
        users,
      }),
    [query, projects, prompts, templates, users],
  )

  return (
    <section className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Recherche globale</h3>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Rechercher projets, prompts, templates, utilisateurs, commentaires, versions"
        className="mt-3 w-full rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm"
      />
      <div className="mt-3 space-y-2 text-sm">
        {query.trim().length === 0 ? (
          <p className="text-[var(--srg-text-muted)]">Saisissez une recherche.</p>
        ) : results.length === 0 ? (
          <p className="text-[var(--srg-text-muted)]">Aucun résultat.</p>
        ) : (
          results.slice(0, 24).map((item) => (
            <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p className="font-semibold text-[var(--srg-text-title)]">[{item.type}] {item.label}</p>
              <p className="mt-1 text-[var(--srg-text-muted)]">{item.meta}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
