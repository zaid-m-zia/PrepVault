import { useState } from 'react'
import Button from '../ui/Button'
import ProjectList from './ProjectList'
import AddProjectModal from './AddProjectModal'
import EditProjectModal from './EditProjectModal'
import type { ProfileProject, ProjectPayload } from './projectTypes'

type ProfileProjectsProps = {
  projects: ProfileProject[]
  isOwnProfile?: boolean
  saving?: boolean
  onAddProject?: (payload: ProjectPayload) => Promise<void>
  onEditProject?: (projectId: string, payload: ProjectPayload) => Promise<void>
  onDeleteProject?: (projectId: string) => Promise<void>
}

export type { ProfileProject, ProjectPayload }

export default function ProfileProjects({
  projects,
  isOwnProfile = false,
  saving = false,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: ProfileProjectsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProfileProject | null>(null)

  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-sm font-semibold text-secondary-text">Projects</h2>
        {isOwnProfile && (
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            Add Project
          </Button>
        )}
      </div>

      <ProjectList
        projects={projects}
        canEdit={isOwnProfile}
        onEdit={(project) => setEditingProject(project)}
        onDelete={(projectId) => {
          const shouldDelete = window.confirm('Are you sure you want to delete this project?')
          if (!shouldDelete) return
          if (!onDeleteProject) return
          void onDeleteProject(projectId)
        }}
      />

      <AddProjectModal
        open={isAddOpen}
        loading={saving}
        onClose={() => setIsAddOpen(false)}
        onSubmit={async (payload) => {
          if (!onAddProject) return
          await onAddProject(payload)
        }}
      />

      <EditProjectModal
        open={Boolean(editingProject)}
        project={editingProject}
        loading={saving}
        onClose={() => setEditingProject(null)}
        onSubmit={async (projectId, payload) => {
          if (!onEditProject) return
          await onEditProject(projectId, payload)
        }}
      />
    </div>
  )
}
