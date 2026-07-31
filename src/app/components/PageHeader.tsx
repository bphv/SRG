import type { ReactNode } from 'react'

export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">
            {title}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--sea-ink)] sm:text-4xl">
            {description}
          </h1>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  )
}
