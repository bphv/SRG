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
    <div className="srg-fade-up srg-premium-panel mb-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="srg-label mb-2">
            {title}
          </p>
          <h1 className="srg-display text-3xl font-semibold tracking-tight text-[var(--srg-text-title)] sm:text-4xl">
            {description}
          </h1>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  )
}
