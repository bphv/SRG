export default function TemplateStatusBadge({
  status,
}: {
  status:
    | 'Official'
    | 'Community'
    | 'Personal'
    | 'Enterprise'
    | 'Draft'
    | 'Archived'
}) {
  const statusStyles: Record<string, string> = {
    Official: 'bg-[rgba(34,197,94,0.12)] text-[var(--sea-ink)] border border-[rgba(34,197,94,0.18)]',
    Community: 'bg-[rgba(59,130,246,0.12)] text-[var(--sea-ink)] border border-[rgba(59,130,246,0.18)]',
    Personal: 'bg-[rgba(168,85,247,0.12)] text-[var(--sea-ink)] border border-[rgba(168,85,247,0.18)]',
    Enterprise: 'bg-[rgba(249,115,22,0.12)] text-[var(--sea-ink)] border border-[rgba(249,115,22,0.18)]',
    Draft: 'bg-[rgba(107,114,128,0.12)] text-[var(--sea-ink)] border border-[rgba(107,114,128,0.18)]',
    Archived: 'bg-[rgba(239,68,68,0.12)] text-[var(--sea-ink)] border border-[rgba(239,68,68,0.18)]',
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status] ?? statusStyles.Draft}`}>
      {status}
    </span>
  )
}
