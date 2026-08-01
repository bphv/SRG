import type { ReactNode } from 'react'

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: Array<{ key: string; label: string }>
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-[var(--srg-radius-lg)] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-2">
      {items.map((item) => {
        const selected = item.key === active
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.key)}
            className={[
              'rounded-xl px-3 py-2 text-sm font-semibold transition',
              selected
                ? 'bg-[var(--srg-color-primary-500)] text-white'
                : 'bg-transparent text-[var(--srg-text-body)] hover:bg-[var(--srg-hover)]',
            ].join(' ')}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function Timeline({
  events,
}: {
  events: Array<{ id: string; title: string; meta?: string; content?: ReactNode }>
}) {
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-[var(--srg-radius-md)] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
          <p className="font-semibold text-[var(--srg-text-title)]">{event.title}</p>
          {event.meta ? <p className="mt-1 text-xs text-[var(--srg-text-muted)]">{event.meta}</p> : null}
          {event.content ? <div className="mt-2 text-sm text-[var(--srg-text-body)]">{event.content}</div> : null}
        </li>
      ))}
    </ol>
  )
}
