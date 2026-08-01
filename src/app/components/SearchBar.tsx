import { useEffect, useState } from 'react'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onSearch,
  onValueChange,
  instant = false,
  persistKey,
}: {
  placeholder?: string
  value?: string
  onSearch: (value: string) => void
  onValueChange?: (value: string) => void
  instant?: boolean
  persistKey?: string
}) {
  const [internalValue, setInternalValue] = useState(value ?? '')
  const [recentSearches, setRecentSearches] = useState<string[]>(() => WorkspacePreferencesService.getPreferences().recentSearches)

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value)
    }
  }, [value, internalValue])

  useEffect(() => {
    if (!instant) return
    onSearch(internalValue)
  }, [instant, internalValue, onSearch])

  useEffect(() => {
    if (!persistKey) return
    const stored = WorkspacePreferencesService.getPreferences().filters[persistKey].query
    if (typeof stored === 'string' && value === undefined) {
      setInternalValue(stored)
    }
  }, [persistKey, value])

  const submitSearch = (nextValue: string) => {
    onSearch(nextValue)
    WorkspacePreferencesService.pushRecentSearch(nextValue)
    setRecentSearches(WorkspacePreferencesService.getPreferences().recentSearches)
    if (persistKey) {
      const currentFilters = WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
      WorkspacePreferencesService.setFilters(persistKey, { ...currentFilters, query: nextValue })
    }
  }

  const suggestions = internalValue.trim()
    ? recentSearches.filter((item) => item.toLowerCase().includes(internalValue.trim().toLowerCase())).slice(0, 8)
    : recentSearches.slice(0, 8)

  const datalistId = persistKey ? `${persistKey}-search-history` : `${placeholder.replace(/\s+/g, '-').toLowerCase()}-search-history`

  return (
    <div className="srg-workspace flex items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 shadow-[var(--srg-shadow-sm)]" role="search">
      <input
        aria-label={placeholder}
        value={internalValue}
        list={datalistId}
        onChange={(event) => {
          setInternalValue(event.target.value)
          onValueChange?.(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submitSearch(internalValue)
          }
        }}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent px-2 text-sm text-[var(--srg-text-body)] outline-none placeholder:text-[var(--srg-text-muted)]"
      />
      <datalist id={datalistId}>
        {suggestions.map((item) => <option key={item} value={item} />)}
      </datalist>
      {internalValue ? (
        <button
          type="button"
          onClick={() => {
            setInternalValue('')
            onValueChange?.('')
            submitSearch('')
          }}
          className="rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-2 text-xs font-semibold text-[var(--srg-text-muted)] transition hover:bg-[var(--srg-hover)]"
          aria-label="Clear search"
        >
          Clear
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => submitSearch(internalValue)}
        className="rounded-2xl border border-transparent bg-[var(--srg-color-primary-500)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--srg-color-primary-600)]"
      >
        Search
      </button>
    </div>
  )
}
