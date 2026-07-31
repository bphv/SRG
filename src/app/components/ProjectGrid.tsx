import type { Project } from '#/app/services/ProjectService'
import ProjectCard from '#/app/components/ProjectCard'

export default function ProjectGrid({
  projects,
  onSelect,
  onFavorite,
}: {
  projects: Project[]
  onSelect: (id: string) => void
  onFavorite: (id: string) => void
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={() => onSelect(project.id)}
          onFavorite={() => onFavorite(project.id)}
        />
      ))}
    </div>
  )
}
