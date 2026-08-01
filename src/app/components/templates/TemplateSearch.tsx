import SearchBar from '#/app/components/SearchBar'

export default function TemplateSearch({
  value,
  onSearch,
  onValueChange,
}: {
  value: string
  onSearch: (value: string) => void
  onValueChange: (value: string) => void
}) {
  return (
    <SearchBar
      placeholder="Rechercher un template..."
      value={value}
      onSearch={onSearch}
      onValueChange={onValueChange}
      instant
      persistKey="template-search"
    />
  )
}
