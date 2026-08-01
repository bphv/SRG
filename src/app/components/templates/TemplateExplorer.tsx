import TemplateSearch from '#/app/components/templates/TemplateSearch'
import TemplateCategorySidebar from '#/app/components/templates/TemplateCategorySidebar'
import TemplateTags from '#/app/components/templates/TemplateTags'

export default function TemplateExplorer({
  search,
  onSearch,
  onValueChange,
  categories,
  selectedCategory,
  onSelectCategory,
  collections,
  favoritesCount,
  tags,
  onTagClick,
}: {
  search: string
  onSearch: (value: string) => void
  onValueChange: (value: string) => void
  categories: Array<{ name: string; count: number }>
  selectedCategory: string
  onSelectCategory: (category: string) => void
  collections: Array<{ name: string; count: number }>
  favoritesCount: number
  tags: string[]
  onTagClick: (tag: string) => void
}) {
  return (
    <aside className="space-y-6 rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-6 shadow-[var(--srg-shadow-md)]">
      <div className="space-y-4">
        <TemplateSearch value={search} onSearch={onSearch} onValueChange={onValueChange} />
        <TemplateCategorySidebar categories={categories} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
      </div>

      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6">
        <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Collections</h3>
        <div className="mt-5 space-y-3 text-sm text-[var(--srg-text-muted)]">
          {collections.map((collection) => (
            <div key={collection.name} className="flex items-center justify-between rounded-3xl bg-[var(--srg-surface)] px-4 py-3">
              <span>{collection.name}</span>
              <span className="rounded-full bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{collection.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Favoris</h3>
          <span className="rounded-full bg-[var(--srg-surface)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{favoritesCount}</span>
        </div>
        <div className="mt-5">
          <TemplateTags tags={tags} onTagClick={onTagClick} />
        </div>
      </div>
    </aside>
  )
}
