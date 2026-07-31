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
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 text-[var(--sea-ink-soft)]">
        Sélectionnez un prompt pour l’éditer.
      </div>
    )
  }

  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <div className="grid gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--sea-ink)]">Nom</label>
          <input
            value={prompt.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--sea-ink)]">Description</label>
          <textarea
            value={prompt.description}
            onChange={(event) => onChange({ description: event.target.value })}
            className="min-h-[120px] rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--sea-ink)]">Catégorie</label>
            <input
              value={prompt.category}
              disabled
              className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[var(--sea-ink)]">Tags</label>
            <input
              value={prompt.tags.join(', ')}
              onChange={(event) => onChange({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })}
              className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--sea-ink)] outline-none"
              placeholder="tag1, tag2"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[var(--sea-ink)]">Prompt</label>
          <textarea
            value={prompt.content}
            onChange={(event) => onChange({ content: event.target.value })}
            className="min-h-[220px] rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-4 text-sm text-[var(--sea-ink)] outline-none font-mono"
          />
        </div>
      </div>
    </div>
  )
}
