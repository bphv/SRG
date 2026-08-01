export default function StatusBadge({
  status,
}: {
  status: 'online' | 'offline' | 'warning' | 'unknown'
}) {
  const colors = {
    online: 'bg-[rgba(86,198,190,0.14)] text-[var(--srg-color-primary-500)] ring-[rgba(86,198,190,0.3)]',
    offline: 'bg-[rgba(223,78,78,0.14)] text-[#9b2f2f] ring-[rgba(223,78,78,0.3)]',
    warning: 'bg-[rgba(234,179,8,0.14)] text-[#684f0b] ring-[rgba(234,179,8,0.3)]',
    unknown: 'bg-[rgba(99,102,241,0.14)] text-[#4338ca] ring-[rgba(99,102,241,0.3)]',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ring-1 ${colors[status]}`}>
      {status}
    </span>
  )
}
