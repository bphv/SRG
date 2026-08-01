export default function TemplateTags({
  tags,
  onTagClick,
}: {
  tags: string[]
  onTagClick: (tag: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onTagClick(tag)}
          className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-sm font-semibold text-[var(--srg-text-title)] transition hover:border-[var(--srg-color-primary-400)]"
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
