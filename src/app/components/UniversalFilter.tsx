/**
 * UniversalFilter — filtre de recherche universel pour les pages SRG.
 *
 * Principes (mission filtre universel) :
 * - Base sur la meme logique de recherche que SmartInputBar (query + suggestions),
 *   mais allege : pas de mode conversation, pas de navigation, pas de commande.
 * - FILTRE LOCAL : il ne quitte jamais la page courante. Le contexte de page
 *   (categorie, sous-categorie, metier) est preserve par conception.
 * - Persistance optionnelle via persistKey (WorkspacePreferencesService.filters).
 * - Accessible : role="search", aria-label, focus visible, Escape pour effacer.
 *
 * Usage :
 *   <UniversalFilter
 *     persistKey="finance-page"
 *     placeholder="Filtrer les vues Finance..."
 *     value={query}
 *     onValueChange={setQuery}
 *     suggestions={['Trésorerie', 'Factures']}
 *   />
 */

import { useEffect, useMemo, useState } from 'react'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

type UniversalFilterProps = {
  /** Cle de persistance du filtre (par page). Recommande : slug de la route. */
  persistKey?: string
  /** Valeur controlee. Si omise, le composant gere son propre etat. */
  value?: string
  /** Callback de changement (filtrage instantane recommande). */
  onValueChange?: (value: string) => void
  /** Soumission explicite (Entree ou bouton Filtrer). */
  onSubmit?: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  /** Suggestions filtrees en fonction de la saisie. */
  suggestions?: string[]
  /** Libelle du resultat, ex: "6 resultats". */
  resultCountLabel?: string
  /** Compact : une seule ligne sans panneau de suggestions. */
  compact?: boolean
}

function readStoredQuery(persistKey?: string): string {
  if (!persistKey) return ''
  const record = WorkspacePreferencesService.getPreferences().filters[persistKey]
  const value = record.query
  return typeof value === 'string' ? value : ''
}

export default function UniversalFilter({
  persistKey,
  value,
  onValueChange,
  onSubmit,
  placeholder = 'Filtrer...',
  ariaLabel,
  suggestions,
  resultCountLabel,
  compact = false,
}: UniversalFilterProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(() => (value !== undefined ? value : readStoredQuery(persistKey)))

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value)
    }
  }, [value, internalValue])

  const currentValue = value !== undefined ? value : internalValue

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
    if (persistKey) {
      const currentFilters = WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
      WorkspacePreferencesService.setFilters(persistKey, { ...currentFilters, query: nextValue })
    }
  }

  const submitValue = (nextValue: string) => {
    onSubmit?.(nextValue)
  }

  const filteredSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return []
    const normalized = currentValue.trim().toLowerCase()
    if (!normalized) return suggestions.slice(0, 6)
    return suggestions.filter((item) => item.toLowerCase().includes(normalized)).slice(0, 6)
  }, [suggestions, currentValue])

  const listId = persistKey ? `${persistKey}-universal-filter-list` : 'universal-filter-list'

  return (
    <div className="space-y-2" role="search" aria-label={ariaLabel ?? placeholder}>
      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-3 py-2 shadow-[var(--srg-shadow-sm)]">
        <span aria-hidden className="text-sm text-[var(--srg-text-muted)]">🔍</span>
        <input
          aria-label={ariaLabel ?? placeholder}
          value={currentValue}
          list={filteredSuggestions.length > 0 ? listId : undefined}
          onChange={(event) => updateValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitValue(currentValue)
            }
            if (event.key === 'Escape' && currentValue) {
              updateValue('')
              submitValue('')
            }
          }}
          placeholder={placeholder}
          className="min-w-[10rem] flex-1 border-0 bg-transparent px-1 text-sm text-[var(--srg-text-body)] outline-none placeholder:text-[var(--srg-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)]"
        />

        {currentValue ? (
          <button
            type="button"
            onClick={() => {
              updateValue('')
              submitValue('')
            }}
            aria-label="Effacer le filtre"
            className="rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-2 py-1 text-xs font-semibold text-[var(--srg-text-title)]"
          >
            Effacer
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => submitValue(currentValue)}
          className="rounded-xl bg-[var(--srg-color-primary-500)] px-3 py-1 text-xs font-semibold text-white"
        >
          Filtrer
        </button>
      </div>

      {filteredSuggestions.length > 0 ? (
        <datalist id={listId}>
          {filteredSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      ) : null}

      {!compact && filteredSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                updateValue(item)
                submitValue(item)
              }}
              className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)] hover:border-[var(--srg-color-primary-400)]"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {resultCountLabel ? (
        <p className="text-xs text-[var(--srg-text-muted)]" role="status">
          {resultCountLabel}
        </p>
      ) : null}
    </div>
  )
}