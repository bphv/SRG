import type { Prompt } from '#/app/services/PromptService'

export default function PromptActionsMenu({
  onDuplicate,
  onArchive,
  onDelete,
}: {
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onDuplicate}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
      >
        Dupliquer
      </button>
      <button
        type="button"
        onClick={onArchive}
        className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] transition hover:border-[var(--lagoon)]"
      >
        Archiver
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-3xl bg-[rgba(223,78,78,0.12)] px-4 py-2 text-sm font-semibold text-[#9b2f2f] transition hover:bg-[rgba(223,78,78,0.18)]"
      >
        Supprimer
      </button>
    </div>
  )
}
