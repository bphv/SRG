import type { ReactNode } from 'react'

export default function EmptyProjects({ action }: { action: ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-10 text-center text-[var(--srg-text-title)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--srg-color-primary-500)]">Aucun projet</p>
      <p className="mt-4 text-sm text-[var(--srg-text-muted)] max-w-xl mx-auto">Créez un projet pour commencer à regrouper vos générations et vos prompts dans un espace dédié.</p>
      <div className="mt-6">{action}</div>
    </div>
  )
}
