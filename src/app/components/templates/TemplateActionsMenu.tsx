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
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
      >
        Modifier
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
      >
        Dupliquer
      </button>
      <button
        type="button"
        onClick={onCreatePrompt}
        className="rounded-3xl bg-[var(--lagoon-deep)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
      >
        Créer Prompt
      </button>
      <button
        type="button"
        onClick={onPublish}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
      >
        Publier
      </button>
      <button
        type="button"
        onClick={onArchive}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
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
