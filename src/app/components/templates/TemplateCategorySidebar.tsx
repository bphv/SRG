export default function TemplateCategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: {
  categories: Array<{ name: string; count: number }>
  selectedCategory: string
  onSelectCategory: (category: string) => void
}) {
  return (
    <aside className="rounded-[2rem] border border-[var(--srg-border)] bg-[var(--srg-surface)] p-5 shadow-[var(--srg-shadow-sm)]">
      <h3 className="text-lg font-semibold text-[var(--srg-text-title)]">Catégories</h3>
      <div className="mt-5 space-y-2">
        {categories.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => onSelectCategory(category.name)}
            className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
              selectedCategory === category.name ? 'bg-[var(--srg-color-primary-500)] text-white' : 'bg-[var(--srg-surface-strong)] text-[var(--srg-text-title)]'
            }`}
          >
            <span>{category.name}</span>
            <span className="rounded-full bg-[var(--srg-surface)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">{category.count}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
