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
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Métadonnées</h3>
      <div className="mt-5 grid gap-4 text-sm text-[var(--sea-ink-soft)] sm:grid-cols-2">
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Auteur</p>
          <p>{author}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Version</p>
          <p>{version}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Créé le</p>
          <p>{createdAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Dernière modif</p>
          <p>{updatedAt}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Langue</p>
          <p>{language}</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--sea-ink)]">Provider recommandé</p>
          <p>{provider}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="font-semibold text-[var(--sea-ink)]">Modèle recommandé</p>
          <p>{recommendedModel}</p>
        </div>
      </div>
    </div>
  )
}
