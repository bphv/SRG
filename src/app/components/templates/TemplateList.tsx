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
    <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_34px_rgba(30,90,72,0.06)]">
      <table className="w-full border-collapse text-sm text-[var(--sea-ink-soft)]">
        <thead className="bg-[var(--surface-strong)] text-left text-xs uppercase tracking-[0.22em] text-[var(--sea-ink-soft)]">
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
            <tr key={template.id} className="border-t border-[var(--line)] hover:bg-[var(--surface-strong)]">
              <td className="px-4 py-4 text-[var(--sea-ink)]">{template.name}</td>
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
                  className="rounded-3xl bg-[var(--lagoon-deep)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--palm)]"
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
