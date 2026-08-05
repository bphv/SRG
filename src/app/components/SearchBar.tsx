import { useEffect, useState } from 'react'
import SmartInputBar from '#/app/components/SmartInputBar'
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
    const persistedFilters = WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
    const stored = persistedFilters.query
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

  return (
    <SmartInputBar
      value={internalValue}
      onValueChange={(nextValue) => {
        setInternalValue(nextValue)
        onValueChange?.(nextValue)
      }}
      onSubmit={submitSearch}
      placeholder={placeholder}
      persistKey={persistKey}
      instant={instant}
      mode="search"
      compact={false}
      submitLabel="Rechercher"
      suggestions={recentSearches}
      persistState={false}
      showDropzone={false}
      ariaLabel={placeholder}
    />
  )
}
