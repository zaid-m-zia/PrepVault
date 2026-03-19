'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Play } from 'lucide-react'
import ResourceViewer from '../../components/ResourceViewer'
import StudyPath from '../../components/resources/StudyPath'
import { buttonClasses } from '../../components/ui/Button'

interface Branch {
  id: string
  name: string
}

interface Semester {
  id: string
  branch_id: string
  semester_number: number
}

interface Subject {
  id: string
  semester_id: string
  name: string
}

interface Module {
  id: string
  subject_id: string
  module_name: string
  created_at?: string
}

interface Resource {
  id: string
  module_id: string
  title: string
  description: string
  resource_type: string
  file_url: string | null
  youtube_link: string | null
  created_at: string
}

type StudyPathStep = {
  id: string
  title: string
  resourceGroups: Array<{
    type: string
    items: Array<{
      id: string
      title: string
      resource_type: string
    }>
  }>
}

const studyPathTypeOrder = ['Notes', 'Playlist', 'Assignment', 'PYQ']

function groupResourcesByType(resources: Resource[]): StudyPathStep['resourceGroups'] {
  return studyPathTypeOrder
    .map((type) => ({
      type,
      items: resources
        .filter((resource) => resource.resource_type === type)
        .map((resource) => ({
          id: resource.id,
          title: resource.title,
          resource_type: resource.resource_type,
        })),
    }))
    .filter((group) => group.items.length > 0)
}

// Create Supabase client outside component to prevent recreation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100svh-4.5rem)] flex-1 px-6 py-12">
          <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col pb-24">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold">Resources</h2>
              <p className="mt-2 text-sm text-secondary-text">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <ResourcesPageContent />
    </Suspense>
  )
}

function ResourcesPageContent() {
  const searchParams = useSearchParams()
  const searchQueryText = searchParams.get('q')
  const fallbackMode = searchParams.get('fallback')
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSemesters, setLoadingSemesters] = useState(false)
  const [loadingSubjects, setLoadingSubjects] = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)
  const [loadingResources, setLoadingResources] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<string>('Notes')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [smartSearchMessage, setSmartSearchMessage] = useState<string | null>(null)
  const [studyPathTitle, setStudyPathTitle] = useState('')
  const [studyPathSteps, setStudyPathSteps] = useState<StudyPathStep[]>([])
  const [studyPathResources, setStudyPathResources] = useState<Record<string, Resource>>({})
  const [loadingStudyPath, setLoadingStudyPath] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [togglingModuleIds, setTogglingModuleIds] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  const selectedSubjectName = subjects.find((subject) => subject.id === selectedSubject)?.name || 'Unknown Subject'

  const fetchProgress = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No user found')
      return
    }

    const { data, error } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      return
    }

    const completedIds = (data || [])
      .filter((item: any) => item.completed)
      .map((item: any) => item.module_id)

    const uniqueIds = [...new Set(completedIds)]
    setCompletedModules(uniqueIds)
  }, [])

  async function toggleModule(moduleId: string, subject: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setTogglingModuleIds((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]))

    const { data: existing } = await supabase
      .from('user_module_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('user_module_progress')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('user_module_progress')
        .insert({
          user_id: user.id,
          module_id: moduleId,
          subject: subject,
          completed: true
        })
    }

    setCompletedModules((prev) => {
      const updated = prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]

      return [...new Set(updated)]
    })

    window.dispatchEvent(new Event('progressUpdated'))

    setTogglingModuleIds((prev) => prev.filter((id) => id !== moduleId))
  }

  useEffect(() => {
    void fetchProgress()
  }, [fetchProgress])

  useEffect(() => {
    const refresh = () => { void fetchProgress() }

    window.addEventListener('progressUpdated', refresh)

    return () => {
      window.removeEventListener('progressUpdated', refresh)
    }
  }, [fetchProgress])

  // Load branches on mount
  useEffect(() => {
    async function fetchBranches() {
      try {
        setError(null)
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name')

        if (error) throw error
        setBranches(data || [])
      } catch (error) {
        console.error('Error fetching branches:', error)
        setError('Failed to load branches')
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  // Load semesters when branch is selected
  useEffect(() => {
    if (!selectedBranch) {
      setSemesters([])
      setSelectedSemester('')
      return
    }

    async function fetchSemesters() {
      try {
        setLoadingSemesters(true)
        setError(null)
        const { data, error } = await supabase
          .from('semesters')
          .select('*')
          .eq('branch_id', selectedBranch)
          .order('semester_number')

        if (error) throw error
        setSemesters(data || [])
      } catch (error) {
        console.error('Error fetching semesters:', error)
        setError('Failed to load semesters')
        setSemesters([])
      } finally {
        setLoadingSemesters(false)
      }
    }

    fetchSemesters()
  }, [selectedBranch])

  // Load subjects when semester is selected
  useEffect(() => {
    if (!selectedSemester) {
      setSubjects([])
      setSelectedSubject('')
      return
    }

    async function fetchSubjects() {
      try {
        setLoadingSubjects(true)
        setError(null)
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', selectedSemester)
          .order('name')

        if (error) throw error
        setSubjects(data || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
        setError('Failed to load subjects')
        setSubjects([])
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [selectedSemester])

  // Load modules when subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setModules([])
      setSelectedModule('')
      return
    }

    async function fetchModules() {
      try {
        setLoadingModules(true)
        setError(null)
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('subject_id', selectedSubject)
          .order('module_name')

        if (error) throw error
        setModules(data || [])
      } catch (error) {
        console.error('Error fetching modules:', error)
        setError('Failed to load modules')
        setModules([])
      } finally {
        setLoadingModules(false)
      }
    }

    fetchModules()
  }, [selectedSubject])

  // Load resources when module is selected
  useEffect(() => {
    if (!selectedModule) {
      setResources([])
      return
    }

    async function fetchResources() {
      try {
        setLoadingResources(true)
        setError(null)
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('module_id', selectedModule)
          .order('created_at', { ascending: false })

        if (error) throw error
        setResources(data || [])
      } catch (error) {
        console.error('Error fetching resources:', error)
        setError('Failed to load resources')
        setResources([])
      } finally {
        setLoadingResources(false)
      }
    }

    fetchResources()
  }, [selectedModule])

  useEffect(() => {
    if (!showRoadmap) {
      setStudyPathTitle('')
      setStudyPathSteps([])
      setStudyPathResources({})
      setLoadingStudyPath(false)
      return
    }

    async function fetchStudyPath() {
      try {
        setLoadingStudyPath(true)

        if (selectedModule) {
          const [{ data: moduleData, error: moduleError }, { data: moduleResources, error: resourcesError }] = await Promise.all([
            supabase
              .from('modules')
              .select('id, module_name')
              .eq('id', selectedModule)
              .single(),
            supabase
              .from('resources')
              .select('*')
              .eq('module_id', selectedModule)
              .order('created_at', { ascending: false }),
          ])

          if (moduleError || !moduleData) throw moduleError
          if (resourcesError) throw resourcesError

          const resolvedResources = (moduleResources ?? []) as Resource[]
          setStudyPathTitle(moduleData.module_name)
          setStudyPathSteps([
            {
              id: moduleData.id,
              title: moduleData.module_name,
              resourceGroups: groupResourcesByType(resolvedResources),
            },
          ])
          setStudyPathResources(
            resolvedResources.reduce<Record<string, Resource>>((accumulator, resource) => {
              accumulator[resource.id] = resource
              return accumulator
            }, {})
          )
          return
        }

        if (selectedSubject) {
          const [{ data: subjectData, error: subjectError }, { data: subjectModules, error: modulesError }] = await Promise.all([
            supabase
              .from('subjects')
              .select('id, name')
              .eq('id', selectedSubject)
              .single(),
            supabase
              .from('modules')
              .select('id, module_name, created_at')
              .eq('subject_id', selectedSubject)
              .order('created_at', { ascending: true }),
          ])

          if (subjectError || !subjectData) throw subjectError
          if (modulesError) throw modulesError

          const orderedModules = (subjectModules ?? []) as Module[]

          if (orderedModules.length === 0) {
            setStudyPathTitle(subjectData.name)
            setStudyPathSteps([])
            setStudyPathResources({})
            return
          }

          const moduleIds = orderedModules.map((module) => module.id)
          const { data: subjectResources, error: resourcesError } = await supabase
            .from('resources')
            .select('*')
            .in('module_id', moduleIds)
            .order('created_at', { ascending: false })

          if (resourcesError) throw resourcesError

          const resolvedResources = (subjectResources ?? []) as Resource[]

          setStudyPathTitle(subjectData.name)
          setStudyPathSteps(
            orderedModules.map((module) => ({
              id: module.id,
              title: module.module_name,
              resourceGroups: groupResourcesByType(
                resolvedResources.filter((resource) => resource.module_id === module.id)
              ),
            }))
          )
          setStudyPathResources(
            resolvedResources.reduce<Record<string, Resource>>((accumulator, resource) => {
              accumulator[resource.id] = resource
              return accumulator
            }, {})
          )
          return
        }

        setStudyPathTitle('')
        setStudyPathSteps([])
        setStudyPathResources({})
      } catch (studyPathError) {
        console.error('Error generating study path:', studyPathError)
        setStudyPathTitle('')
        setStudyPathSteps([])
        setStudyPathResources({})
      } finally {
        setLoadingStudyPath(false)
      }
    }

    fetchStudyPath()
  }, [showRoadmap, selectedModule, selectedSubject])

  useEffect(() => {
    if (!selectedSubject) {
      setShowRoadmap(false)
    }
  }, [selectedSubject])

  // Auto-select hierarchy from smart search query params.
  useEffect(() => {
    const subjectId = searchParams.get('subject')
    const moduleId = searchParams.get('module')

    if (!subjectId && !moduleId) {
      if (fallbackMode === 'closest' && searchQueryText) {
        setSmartSearchMessage(`Showing closest match for: ${searchQueryText}`)
      } else if (fallbackMode === 'subjects') {
        setSmartSearchMessage('No exact match found. Showing available subjects.')
      } else {
        setSmartSearchMessage(null)
      }
      return
    }

    async function applySmartSelection() {
      try {
        setError(null)

        if (moduleId) {
          const { data: moduleData, error: moduleError } = await supabase
            .from('modules')
            .select('id, module_name, subject_id')
            .eq('id', moduleId)
            .single()

          if (moduleError || !moduleData) {
            setSmartSearchMessage('No exact match found. Showing closest resources.')
            return
          }

          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id, semester_id')
            .eq('id', moduleData.subject_id)
            .single()

          if (subjectError || !subjectData) throw subjectError

          const { data: semesterData, error: semesterError } = await supabase
            .from('semesters')
            .select('id, branch_id')
            .eq('id', subjectData.semester_id)
            .single()

          if (semesterError || !semesterData) throw semesterError

          setSelectedBranch(semesterData.branch_id)
          setSelectedSemester(semesterData.id)
          setSelectedSubject(subjectData.id)
          setSelectedModule(moduleData.id)
          setSmartSearchMessage(`Showing resources for ${moduleData.module_name}`)
          return
        }

        if (subjectId) {
          const { data: subjectData, error: subjectError } = await supabase
            .from('subjects')
            .select('id, name, semester_id')
            .eq('id', subjectId)
            .single()

          if (subjectError || !subjectData) {
            setSmartSearchMessage('No exact match found. Showing closest resources.')
            return
          }

          const { data: semesterData, error: semesterError } = await supabase
            .from('semesters')
            .select('id, branch_id')
            .eq('id', subjectData.semester_id)
            .single()

          if (semesterError || !semesterData) throw semesterError

          setSelectedBranch(semesterData.branch_id)
          setSelectedSemester(semesterData.id)
          setSelectedSubject(subjectData.id)
          setSelectedModule('')
          setSmartSearchMessage(`Showing modules for ${subjectData.name}`)
        }
      } catch (selectionError) {
        console.error('Error applying smart search selection:', selectionError)
        setSmartSearchMessage('No exact match found. Showing closest resources.')
      }
    }

    applySmartSelection()
  }, [fallbackMode, searchParams, searchQueryText])

  const handleBranchChange = useCallback((branchId: string) => {
    setSelectedBranch(branchId)
    setSelectedSemester('')
    setSelectedSubject('')
    setSelectedModule('')
    setSmartSearchMessage(null)
    setError(null)
  }, [])

  const handleSemesterChange = useCallback((semesterId: string) => {
    setSelectedSemester(semesterId)
    setSelectedSubject('')
    setSelectedModule('')
    setSmartSearchMessage(null)
    setError(null)
  }, [])

  const handleSubjectChange = useCallback((subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedModule('')
    setSmartSearchMessage(null)
    setError(null)
  }, [])

  const handleModuleChange = useCallback((moduleId: string) => {
    setSelectedModule(moduleId)
    setSmartSearchMessage(null)
    setError(null)
  }, [])

  const openViewer = useCallback((resource: Resource) => {
    setSelectedResource(resource)
    setViewerOpen(true)
  }, [])

  const closeViewer = useCallback(() => {
    setViewerOpen(false)
    setSelectedResource(null)
  }, [])

  const openStudyPathResource = useCallback((resourceId: string) => {
    const resource = studyPathResources[resourceId]
    if (!resource) return

    setSelectedResource(resource)
    setViewerOpen(true)
    setActiveTab(resource.resource_type)
  }, [studyPathResources])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold">Resources</h2>
            <p className="mt-2 text-sm text-secondary-text">Loading...</p>
          </div>
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <main className="flex min-h-[calc(100svh-4.5rem)] flex-1 px-6 py-12">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col pb-24">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Resources</h2>
          <p className="mt-2 text-sm text-secondary-text">
            Browse curated, exam-focused resources organized by branch, semester, subject, and module.
          </p>
          {searchQueryText && (
            <p className="mt-3 text-sm text-indigo-600 dark:text-cyan-300">Showing results for: {searchQueryText}</p>
          )}
          {smartSearchMessage && (
            <p className="mt-3 text-sm text-indigo-600 dark:text-cyan-300">{smartSearchMessage}</p>
          )}
        </div>

        {/* Hierarchical filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Branch */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary-text">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary-text">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
                disabled={!selectedBranch || loadingSemesters}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">
                  {loadingSemesters ? 'Loading...' : 'Select Semester'}
                </option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>Semester {semester.semester_number}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary-text">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!selectedSemester || loadingSubjects}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">
                  {loadingSubjects ? 'Loading...' : 'Select Subject'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            {/* Module */}
            <div>
              <label className="block text-sm font-medium mb-2 text-secondary-text">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => handleModuleChange(e.target.value)}
                disabled={!selectedSubject || loadingModules}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">
                  {loadingModules ? 'Loading...' : 'Select Module'}
                </option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>{module.module_name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {selectedSubject && modules.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <div
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Module Progress</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Track each module individually with persistent progress.
                  </p>
                </div>

                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>

              <div
                className={`transition-all duration-500 overflow-hidden ${
                  isExpanded ? 'max-h-[1000px] mt-4' : 'max-h-0'
                }`}
              >
                <div
                  className={`transition-opacity duration-300 ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {modules.map((module) => {
                      const moduleProgressId = `${selectedSubjectName}-${module.module_name}`
                      const isCompleted = completedModules.includes(moduleProgressId)
                      const isToggling = togglingModuleIds.includes(moduleProgressId)

                      return (
                        <motion.div
                          key={module.id}
                          layout
                          className={`rounded-lg border p-4 transition-all duration-300 ${
                            isCompleted
                              ? 'border-emerald-400/40 bg-emerald-500/10'
                              : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                          }`}
                        >
                          <p className="text-sm font-medium mb-3 text-gray-900 dark:text-white">{module.module_name}</p>
                          {isCompleted ? (
                            <button
                              onClick={() => toggleModule(moduleProgressId, selectedSubjectName)}
                              disabled={isToggling}
                              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70"
                            >
                              {isToggling ? 'Saving...' : '✔ Completed'}
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleModule(moduleProgressId, selectedSubjectName)}
                              disabled={isToggling}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70"
                            >
                              {isToggling ? 'Saving...' : 'Mark as Done'}
                            </button>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedSubject && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={() => setShowRoadmap((value) => !value)}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              {showRoadmap ? 'Hide Study Roadmap' : 'Generate Study Roadmap'}
            </button>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {showRoadmap && (selectedSubject || selectedModule) && (
            <motion.div
              initial={{ opacity: 0, y: 12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <StudyPath
                title={studyPathTitle || 'Your Learning Roadmap'}
                query={searchQueryText}
                steps={studyPathSteps}
                loading={loadingStudyPath}
                onOpenResource={openStudyPathResource}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resource Type Tabs */}
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex gap-3 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('Notes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'Notes'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'glass border border-white/10 text-secondary-text hover:border-cyan-400/30 hover:text-primary-text'
                }`}
              >
                📘 Notes
              </button>
              <button
                onClick={() => setActiveTab('PYQ')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'PYQ'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'glass border border-white/10 text-secondary-text hover:border-cyan-400/30 hover:text-primary-text'
                }`}
              >
                📄 PYQs
              </button>
              <button
                onClick={() => setActiveTab('Assignment')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'Assignment'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'glass border border-white/10 text-secondary-text hover:border-cyan-400/30 hover:text-primary-text'
                }`}
              >
                📝 Assignments
              </button>
              <button
                onClick={() => setActiveTab('Playlist')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'Playlist'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'glass border border-white/10 text-secondary-text hover:border-cyan-400/30 hover:text-primary-text'
                }`}
              >
                ▶ Playlists
              </button>
            </div>
          </motion.div>
        )}

        {/* Resources Grid */}
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loadingResources ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="glass rounded-xl p-6 border border-white/10">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-white/10 rounded w-1/4"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4"></div>
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              resources
                .filter((resource) => resource.resource_type === activeTab)
                .map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} onOpen={() => openViewer(resource)} />
                ))
            )}
          </motion.div>
        )}

        <ResourceViewer
          open={viewerOpen}
          onClose={closeViewer}
          resource={selectedResource}
        />

        {selectedModule && !loadingResources && resources.filter((resource) => resource.resource_type === activeTab).length === 0 && (
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <p className="text-secondary-text">No resources available in this category.</p>
          </div>
        )}

        {!selectedModule && (
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <p className="text-secondary-text">Select a module to view resources.</p>
          </div>
        )}
      </div>
    </main>
  )
}

function ResourceCard({ resource, onOpen }: { resource: Resource; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-xl p-6 border border-white/10 hover:border-cyan-400/30 transition-all"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">
            {resource.resource_type}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
        <p className="text-sm text-secondary-text">{resource.description}</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onOpen}
          className={buttonClasses({ size: 'sm' })}
        >
          <Play className="w-4 h-4" />
          Open Resource
        </button>
      </div>
    </motion.div>
  )
}
