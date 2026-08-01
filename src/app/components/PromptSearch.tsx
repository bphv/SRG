import SearchBar from '#/app/components/SearchBar'

export default function PromptSearch({
  value,
  onSearch,
  onValueChange,
}: {
  value: string
  onSearch: (value: string) => void
  onValueChange: (value: string) => void
}) {
  return <SearchBar placeholder="Rechercher un prompt..." value={value} onSearch={onSearch} onValueChange={onValueChange} instant persistKey="prompt-search" />
}
