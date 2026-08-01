import type { PromptVersion } from '#/app/services/PromptService'

export default function PromptHistory({ history }: { history: PromptVersion[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Historique</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Actions récentes et versions sauvegardées.</p>
      </div>
      <div className="space-y-3 text-sm text-[var(--srg-text-muted)]">
        {history.slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-4">
            <p className="font-semibold text-[var(--srg-text-title)]">Version {item.version}</p>
            <p className="mt-1">{item.date} • {item.author}</p>
            <p className="mt-2 text-xs">{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
