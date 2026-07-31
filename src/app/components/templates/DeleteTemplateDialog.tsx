export default function DeleteTemplateDialog({
  templateName,
  onConfirm,
  onCancel,
}: {
  templateName: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_18px_34px_rgba(30,90,72,0.08)]">
      <h2 className="text-xl font-semibold text-[var(--sea-ink)]">Supprimer le template</h2>
      <p className="mt-3 text-sm text-[var(--sea-ink-soft)]">
        Êtes-vous sûr de vouloir supprimer « {templateName} » ? Cette action est irréversible.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-3xl bg-[rgba(223,78,78,0.12)] px-4 py-3 text-sm font-semibold text-[#9b2f2f] transition hover:bg-[rgba(223,78,78,0.18)]"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
