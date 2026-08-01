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
    <div className="rounded-[2rem] border border-dashed border-[var(--line)] bg-[linear-gradient(180deg,rgba(248,252,250,0.96),rgba(232,243,238,0.92))] p-10 text-center text-[var(--sea-ink)] dark:bg-[linear-gradient(180deg,rgba(21,33,28,0.96),rgba(18,26,23,0.94))]">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] text-3xl shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
          {illustration ?? <span aria-hidden>◇</span>}
        </div>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--lagoon-deep)]">{eyebrow ?? 'Workspace state'}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--sea-ink)]">{title}</p>
      <p className="mt-4 text-sm text-[var(--sea-ink-soft)] max-w-xl mx-auto">{description}</p>
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
