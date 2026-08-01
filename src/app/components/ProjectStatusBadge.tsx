import type { ProjectStatus } from '#/app/services/ProjectService'

const statusStyles: Record<ProjectStatus, string> = {
  active: 'bg-[rgba(86,198,190,0.14)] text-[var(--srg-color-primary-500)] ring-[rgba(86,198,190,0.3)]',
  archived: 'bg-[rgba(223,78,78,0.14)] text-[#9b2f2f] ring-[rgba(223,78,78,0.3)]',
  draft: 'bg-[rgba(234,179,8,0.14)] text-[#684f0b] ring-[rgba(234,179,8,0.3)]',
}

export default function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ring-1 ${statusStyles[status]}`}>
      {status}
    </span>
  )
}
