export default function TemplateMetadata({
  author,
  version,
  createdAt,
  updatedAt,
  language,
  provider,
  recommendedModel,
}: {
  author: string
  version: string
  createdAt: string
  updatedAt: string
  language: string
  provider: string
  recommendedModel: string
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6 shadow-[var(--srg-shadow-md)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Métadonnées</h3>
      <div className="mt-5 grid gap-4 text-sm text-[var(--srg-text-muted)] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Auteur</p>
          <p>{author}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Version</p>
          <p>{version}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Créé le</p>
          <p>{createdAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Dernière modif</p>
          <p>{updatedAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Langue</p>
          <p>{language}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--srg-text-title)]">Provider recommandé</p>
          <p>{provider}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-[var(--srg-text-title)]">Modèle recommandé</p>
          <p>{recommendedModel}</p>
        </div>
      </div>
    </div>
  )
}
