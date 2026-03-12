'use client'

import { BookOpen, Sparkles } from 'lucide-react'

type StudyPathResource = {
  id: string
  title: string
  resource_type: string
}

type StudyPathGroup = {
  type: string
  items: StudyPathResource[]
}

type StudyPathStep = {
  id: string
  title: string
  resourceGroups: StudyPathGroup[]
}

interface StudyPathProps {
  title: string
  query: string | null
  steps: StudyPathStep[]
  loading: boolean
  onOpenResource: (resourceId: string) => void
}

const resourceTypeOrder = ['Notes', 'Playlist', 'Assignment', 'PYQ']

export default function StudyPath({ title, query, steps, loading, onOpenResource }: StudyPathProps) {
  if (loading) {
    return (
      <section className="mb-8 glass rounded-2xl border border-white/10 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="h-4 w-72 rounded bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-32 rounded-xl bg-white/5" />
            <div className="h-32 rounded-xl bg-white/5" />
          </div>
        </div>
      </section>
    )
  }

  if (steps.length === 0) {
    return null
  }

  return (
    <section id="study-paths" className="mb-8 glass rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Study Path
          </div>
          <h3 className="mt-3 text-2xl font-display font-semibold">Study Path - {title}</h3>
          {query && <p className="mt-2 text-sm text-secondary-text">Built from your search for "{query}".</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {steps.map((step, index) => {
          const orderedGroups = [...step.resourceGroups].sort(
            (left, right) => resourceTypeOrder.indexOf(left.type) - resourceTypeOrder.indexOf(right.type)
          )

          return (
            <article key={step.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-cyan-300">Step {index + 1}</p>
                  <h4 className="mt-2 text-lg font-semibold text-primary-text">{step.title}</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {orderedGroups.map((group) => (
                    <span
                      key={group.type}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-slate-100 px-3 py-1 text-xs font-medium text-secondary-text dark:border-white/10 dark:bg-white/5"
                    >
                      {group.type}
                      <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-600 dark:bg-cyan-500/20 dark:text-cyan-300">
                        {group.items.length}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {orderedGroups.flatMap((group) =>
                  group.items.map((resource) => (
                    <button
                      key={resource.id}
                      type="button"
                      onClick={() => onOpenResource(resource.id)}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition-colors hover:border-cyan-400/40 hover:shadow-md dark:border-white/10 dark:bg-slate-950/30 dark:hover:bg-slate-900/60"
                    >
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-cyan-500/15 dark:text-cyan-300">
                        <BookOpen className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-primary-text">{resource.title}</span>
                        <span className="mt-1 block text-xs text-secondary-text">{resource.resource_type}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
