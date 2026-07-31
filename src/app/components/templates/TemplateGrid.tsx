import TemplateCard, { type TemplateCardData } from '#/app/components/templates/TemplateCard'

export default function TemplateGrid({
  templates,
  onOpen,
  onDuplicate,
  onCreatePrompt,
  onToggleFavorite,
}: {
  templates: TemplateCardData[]
  onOpen: (id: string) => void
  onDuplicate: (id: string) => void
  onCreatePrompt: (id: string) => void
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onOpen={onOpen}
          onDuplicate={onDuplicate}
          onCreatePrompt={onCreatePrompt}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}
