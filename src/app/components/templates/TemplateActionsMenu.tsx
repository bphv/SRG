export default function TemplateActionsMenu({
  onEdit,
  onDuplicate,
  onCreatePrompt,
  onPublish,
  onArchive,
  onDelete,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onCreatePrompt: () => void
  onPublish: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
      >
        Modifier
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
      >
        Dupliquer
      </button>
      <button
        type="button"
        onClick={onCreatePrompt}
        className="rounded-3xl bg-[var(--srg-color-primary-500)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
      >
        Créer Prompt
      </button>
      <button
        type="button"
        onClick={onPublish}
        className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
      >
        Publier
      </button>
      <button
        type="button"
        onClick={onArchive}
        className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
      >
        Archiver
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-3xl bg-[rgba(223,78,78,0.12)] px-4 py-3 text-sm font-semibold text-[#9b2f2f] transition hover:bg-[rgba(223,78,78,0.18)]"
      >
        Supprimer
      </button>
    </div>
  )
}
