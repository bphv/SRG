import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-[var(--surface-strong)] p-10 text-center text-[var(--sea-ink)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">{title}</p>
      <p className="mt-4 text-sm text-[var(--sea-ink-soft)] max-w-xl mx-auto">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
