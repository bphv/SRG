import TemplateStatusBadge from '#/app/components/templates/TemplateStatusBadge'
import TemplateFavoriteButton from '#/app/components/templates/TemplateFavoriteButton'

export type TemplateListData = {
  id: string
  name: string
  category: string
  version: string
  provider: string
  updatedAt: string
  status: 'Official' | 'Community' | 'Personal' | 'Enterprise' | 'Draft' | 'Archived'
  favorite: boolean
}

export default function TemplateList({
  templates,
  onOpen,
  onToggleFavorite,
}: {
  templates: TemplateListData[]
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] shadow-[var(--srg-shadow-sm)]">
      <table className="w-full border-collapse text-sm text-[var(--srg-text-muted)]">
        <thead className="bg-[var(--srg-surface-strong)] text-left text-xs uppercase tracking-[0.22em] text-[var(--srg-text-muted)]">
          <tr>
            <th className="px-4 py-4">Nom</th>
            <th className="px-4 py-4">Catégorie</th>
            <th className="px-4 py-4">Version</th>
            <th className="px-4 py-4">Provider</th>
            <th className="px-4 py-4">Modifié</th>
            <th className="px-4 py-4">Statut</th>
            <th className="px-4 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id} className="border-t border-[var(--srg-border)] hover:bg-[var(--srg-surface-strong)]">
              <td className="px-4 py-4 text-[var(--srg-text-title)]">{template.name}</td>
              <td className="px-4 py-4">{template.category}</td>
              <td className="px-4 py-4">{template.version}</td>
              <td className="px-4 py-4">{template.provider}</td>
              <td className="px-4 py-4">{template.updatedAt}</td>
              <td className="px-4 py-4">
                <TemplateStatusBadge status={template.status} />
              </td>
              <td className="px-4 py-4 space-x-2">
                <TemplateFavoriteButton favorite={template.favorite} onToggle={() => onToggleFavorite(template.id)} />
                <button
                  type="button"
                  onClick={() => onOpen(template.id)}
                  className="rounded-3xl bg-[var(--srg-color-primary-500)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
                >
                  Ouvrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
