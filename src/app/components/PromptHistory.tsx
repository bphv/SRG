import type { PromptVersion } from '#/app/services/PromptService'

export default function PromptHistory({ history }: { history: PromptVersion[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Historique</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Actions récentes et versions sauvegardées.</p>
      </div>
      <div className="space-y-3 text-sm text-[var(--sea-ink-soft)]">
        {history.slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
            <p className="font-semibold text-[var(--sea-ink)]">Version {item.version}</p>
            <p className="mt-1">{item.date} • {item.author}</p>
            <p className="mt-2 text-xs">{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
