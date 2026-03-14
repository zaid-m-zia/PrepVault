import ProjectCard from './ProjectCard'
import type { ProfileProject } from './projectTypes'

type ProjectListProps = {
  projects: ProfileProject[]
  canEdit?: boolean
  onEdit?: (project: ProfileProject) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectList({ projects, canEdit = false, onEdit, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return <p className="text-sm text-secondary-text">No projects added yet.</p>
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} canEdit={canEdit} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
