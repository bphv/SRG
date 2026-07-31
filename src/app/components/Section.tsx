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
    <section className="mb-8 rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-[var(--sea-ink)]">{title}</h2>
        {description ? <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
