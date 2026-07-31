import type { PromptVersion } from '#/app/services/PromptService'

export default function PromptVersionPanel({ versions }: { versions: PromptVersion[] }) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--lagoon-deep)]">Versions</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">Historique des sauvegardes du prompt.</p>
      </div>
      <div className="space-y-4">
        {versions.map((version) => (
          <div key={version.id} className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-[var(--sea-ink)]">Version {version.version}</p>
                <p className="text-sm text-[var(--sea-ink-soft)]">{version.date} • {version.author}</p>
              </div>
              <p className="text-sm text-[var(--sea-ink-soft)]">{version.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
