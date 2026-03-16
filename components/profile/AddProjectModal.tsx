import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../ui/Button'
import type { ProjectPayload } from './projectTypes'

type AddProjectModalProps = {
  open: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: ProjectPayload) => Promise<void>
}

export default function AddProjectModal({ open, loading = false, onClose, onSubmit }: AddProjectModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [demoLink, setDemoLink] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!open || !mounted) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: ProjectPayload = {
      title: title.trim(),
      description: description.trim(),
      tech_stack: techStackInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      github_link: githubLink.trim(),
      demo_link: demoLink.trim(),
    }

    if (!payload.title) return

    await onSubmit(payload)
    setTitle('')
    setDescription('')
    setTechStackInput('')
    setGithubLink('')
    setDemoLink('')
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-y-auto p-4">
      <div className="w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto glass rounded-xl p-6 border border-white/10 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Project</h3>
          <button onClick={onClose} className="text-secondary-text hover:text-slate-900 dark:hover:text-slate-100">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
            <input value={techStackInput} onChange={(e) => setTechStackInput(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub Link</label>
              <input type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Demo Link</label>
              <input type="url" value={demoLink} onChange={(e) => setDemoLink(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/3 px-3 py-2" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Project'}</Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
