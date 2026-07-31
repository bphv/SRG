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
    <article className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(30,90,72,0.1)]">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TemplateStatusBadge status={template.status} />
            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sea-ink-soft)]">{template.category}</span>
          </div>
          <h3 className="text-xl font-semibold text-[var(--sea-ink)]">{template.name}</h3>
          <p className="text-sm text-[var(--sea-ink-soft)]">{template.description}</p>
        </div>
        <TemplateFavoriteButton favorite={template.favorite} onToggle={() => onToggleFavorite(template.id)} />
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
          <p className="font-semibold text-[var(--sea-ink)]">Version</p>
          <p className="mt-1">{template.version}</p>
        </div>
        <div className="rounded-3xl bg-[var(--surface-strong)] p-4 text-sm text-[var(--sea-ink-soft)]">
          <p className="font-semibold text-[var(--sea-ink)]">Provider recommandé</p>
          <p className="mt-1">{template.provider}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 text-sm text-[var(--sea-ink-soft)]">
        {template.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-[var(--surface-strong)] px-3 py-1">{tag}</span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onOpen(template.id)}
          className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
        >
          Ouvrir
        </button>
        <button
          type="button"
          onClick={() => onDuplicate(template.id)}
          className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
        >
          Dupliquer
        </button>
        <button
          type="button"
          onClick={() => onCreatePrompt(template.id)}
          className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
        >
          Créer un prompt
        </button>
      </div>
    </article>
  )
}
