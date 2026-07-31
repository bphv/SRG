export default function Loading() {
  return (
    <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] p-8 text-center text-[var(--sea-ink-soft)]">
      <div className="mx-auto mb-4 h-14 w-14 animate-[spin_1.2s_linear_infinite] rounded-full border-4 border-[var(--lagoon-deep)] border-t-transparent" />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  )
}
