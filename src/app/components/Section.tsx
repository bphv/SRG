import type { ReactNode } from 'react'

export default function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="srg-fade-up srg-workspace mb-8 rounded-[var(--srg-radius-xl)] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <h2 className="srg-h3 text-xl font-semibold text-[var(--srg-text-title)]">{title}</h2>
        {description ? <p className="srg-body mt-2 text-sm text-[var(--srg-text-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
