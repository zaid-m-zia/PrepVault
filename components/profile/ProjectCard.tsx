import Button from '../ui/Button'
import type { ProfileProject } from './projectTypes'

type ProjectCardProps = {
  project: ProfileProject
  canEdit?: boolean
  onEdit?: (project: ProfileProject) => void
  onDelete?: (projectId: string) => void
}

export default function ProjectCard({ project, canEdit = false, onEdit, onDelete }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold">{project.title}</h3>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onEdit?.(project)}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => onDelete?.(project.id)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {project.description && (
        <p className="mt-2 text-sm text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
          {project.description}
        </p>
      )}

      {project.tech_stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <span key={`${project.id}-${tech}`} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">
              {tech}
            </span>
          ))}
        </div>
      )}

      {(project.github_link || project.demo_link) && (
        <div className="mt-3 flex flex-wrap gap-3">
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition"
            >
              GitHub
            </a>
          )}
          {project.demo_link && (
            <a
              href={project.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition"
            >
              Live Demo
            </a>
          )}
        </div>
      )}
    </article>
  )
}
