import type { Prompt } from '#/app/services/PromptService'

export default function PromptEditor({
  prompt,
  onChange,
}: {
  prompt: Prompt | null
  onChange: (updates: Partial<Prompt>) => void
}) {
  if (!prompt) {
    return (
      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 text-[var(--srg-text-muted)]">
        Sélectionnez un prompt pour l’éditer.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--srg-text-title)]">Nom</label>
          <input
            value={prompt.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--srg-text-title)]">Description</label>
          <textarea
            value={prompt.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className="min-h-[120px] rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Catégorie</label>
            <input
              value={prompt.category}
              disabled
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--srg-text-title)]">Tags</label>
            <input
              value={prompt.tags.join(', ')}
              onChange={(event) => onChange({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
              className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm text-[var(--srg-text-title)] outline-none"
              placeholder="tag1, tag2"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--srg-text-title)]">Prompt</label>
          <textarea
            value={prompt.content}
            onChange={(event) => onChange({ content: event.target.value })}
            className="min-h-[220px] rounded-[1.75rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-4 text-sm text-[var(--srg-text-title)] outline-none font-mono"
          />
        </div>
      </div>
    </div>
  )
}
