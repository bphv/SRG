import type { ReactNode } from 'react'

export default function EmptyState({
  eyebrow,
  illustration,
  title,
  description,
  action,
  secondaryAction,
}: {
  eyebrow?: string
  illustration?: ReactNode
  title: string
  description: string
  action?: ReactNode
  secondaryAction?: ReactNode
}) {
  return (
    <div className="srg-state-block p-10 text-center text-[var(--srg-text-body)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] text-3xl shadow-[var(--srg-shadow-sm)]">
          {illustration ?? <span aria-hidden>◇</span>}
        </div>
      </div>
      <p className="srg-label mt-5">{eyebrow ?? 'Workspace state'}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--srg-text-title)]">{title}</p>
      <p className="mt-4 mx-auto max-w-xl text-sm text-[var(--srg-text-muted)]">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
