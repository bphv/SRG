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
    <div className="srg-workspace flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 shadow-[var(--srg-shadow-sm)]">
      <input
        aria-label={placeholder}
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
        className="w-full border-0 bg-transparent px-2 text-sm text-[var(--srg-text-body)] outline-none placeholder:text-[var(--srg-text-muted)]"
      />
      <button
        type="button"
        onClick={() => onSearch(internalValue)}
        className="rounded-2xl border border-transparent bg-[var(--srg-color-primary-500)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
      >
        Search
      </button>
    </div>
  )
}
