import { useEffect, useState } from 'react'

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onSearch,
  onValueChange,
}: {
  placeholder?: string
  value?: string
  onSearch: (value: string) => void
  onValueChange?: (value: string) => void
}) {
  const [internalValue, setInternalValue] = useState(value ?? '')

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value)
    }
  }, [value, internalValue])

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] px-3 py-2 shadow-[0_8px_22px_rgba(30,90,72,0.08)]">
      <input
        value={internalValue}
        onChange={(event) => {
          setInternalValue(event.target.value)
          onValueChange?.(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSearch(internalValue)
          }
        }}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent px-2 text-sm text-[var(--sea-ink)] outline-none placeholder:text-[var(--sea-ink-soft)]"
      />
      <button
        type="button"
        onClick={() => onSearch(internalValue)}
        className="rounded-2xl bg-[var(--lagoon-deep)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--palm)]"
      >
        Search
      </button>
    </div>
  )
}
