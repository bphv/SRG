import type { PromptFilters } from '#/app/services/PromptService'

export default function PromptFilters({
  filters,
  onFilterChange,
}: {
  filters: PromptFilters
  onFilterChange: (filters: Partial<PromptFilters>) => void
}) {
  return (
    <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-md)]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.status}
          onChange={(event) => onFilterChange({ status: event.target.value as PromptFilters['status'] })}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm text-[var(--srg-text-title)] outline-none"
        >
          <option value="all">Tous statuts</option>
          <option value="active">Actifs</option>
          <option value="archived">Archivés</option>
          <option value="draft">Brouillons</option>
        </select>
        <select
          value={filters.provider}
          onChange={(event) => onFilterChange({ provider: event.target.value as PromptFilters['provider'] })}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm text-[var(--srg-text-title)] outline-none"
        >
          <option value="all">Tous providers</option>
          <option value="OpenAI">OpenAI</option>
          <option value="Anthropic">Anthropic</option>
          <option value="Azure OpenAI">Azure OpenAI</option>
          <option value="Cohere">Cohere</option>
        </select>
        <select
          value={filters.category}
          onChange={(event) => onFilterChange({ category: event.target.value as PromptFilters['category'] })}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm text-[var(--srg-text-title)] outline-none"
        >
          <option value="all">Toutes catégories</option>
          <option value="summary">Summary</option>
          <option value="onboarding">Onboarding</option>
          <option value="research">Research</option>
          <option value="marketing">Marketing</option>
          <option value="utility">Utility</option>
        </select>
        <button
          type="button"
          onClick={() => onFilterChange({ status: 'all', provider: 'all', category: 'all', query: '', favoritesOnly: false })}
          className="rounded-3xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}
