import type { PromptVersion } from '#/app/services/PromptService'

export default function PromptVersionPanel({ versions }: { versions: PromptVersion[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--srg-color-primary-500)]">Versions</p>
        <p className="text-sm text-[var(--srg-text-muted)]">Historique des sauvegardes du prompt.</p>
      </div>
      <div className="space-y-4">
        {versions.map((version) => (
          <div key={version.id} className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--srg-text-title)]">Version {version.version}</p>
                <p className="text-sm text-[var(--srg-text-muted)]">{version.date} • {version.author}</p>
              </div>
              <p className="text-sm text-[var(--srg-text-muted)]">{version.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
