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
    <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_18px_34px_rgba(30,90,72,0.06)]">
      <h3 className="text-lg font-semibold text-[var(--sea-ink)]">Catégories</h3>
      <div className="mt-5 space-y-2">
        {categories.map((category) => (
          <button
            key={category.name}
            type="button"
            onClick={() => onSelectCategory(category.name)}
            className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
              selectedCategory === category.name ? 'bg-[var(--lagoon-deep)] text-white' : 'bg-[var(--surface-strong)] text-[var(--sea-ink)]'
            }`}
          >
            <span>{category.name}</span>
            <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--sea-ink-soft)]">{category.count}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
