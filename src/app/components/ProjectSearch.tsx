import SearchBar from '#/app/components/SearchBar'

export default function ProjectSearch({
  value,
  onSearch,
  onValueChange,
}: {
  value: string
  onSearch: (value: string) => void
  onValueChange: (value: string) => void
}) {
  return <SearchBar placeholder="Rechercher un projet..." value={value} onSearch={onSearch} onValueChange={onValueChange} instant persistKey="project-search" />
}
