import TemplateFavoriteButton from '#/app/components/templates/TemplateFavoriteButton'
import TemplateStatusBadge from '#/app/components/templates/TemplateStatusBadge'

export type TemplateCardData = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  provider: string
  status: 'Official' | 'Community' | 'Personal' | 'Enterprise' | 'Draft' | 'Archived'
  favorite: boolean
}

export default function TemplateCard({
  template,
  onOpen,
  onDuplicate,
  onCreatePrompt,
  onToggleFavorite,
}: {
  template: TemplateCardData
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onCreatePrompt: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  return (
    <article className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--srg-shadow-lg)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TemplateStatusBadge status={template.status} />
            <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--srg-text-muted)]">{template.category}</span>
          </div>
          <h3 className="text-xl font-semibold text-[var(--srg-text-title)]">{template.name}</h3>
          <p className="text-sm text-[var(--srg-text-muted)]">{template.description}</p>
        </div>
        <TemplateFavoriteButton favorite={template.favorite} onToggle={() => onToggleFavorite(template.id)} />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Version</p>
          <p className="mt-1">{template.version}</p>
        </div>
        <div className="rounded-3xl bg-[var(--srg-surface-strong)] p-4 text-sm text-[var(--srg-text-muted)]">
          <p className="font-semibold text-[var(--srg-text-title)]">Provider recommandé</p>
          <p className="mt-1">{template.provider}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-sm text-[var(--srg-text-muted)]">
        {template.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1">{tag}</span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onOpen(template.id)}
          className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
        >
          Ouvrir
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(template.id)}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
        >
          Dupliquer
        </button>
        <button
          type="button"
          onClick={() => onCreatePrompt(template.id)}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
        >
          Créer un prompt
        </button>
      </div>
    </article>
  )
}
