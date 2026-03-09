'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { Download, Play } from 'lucide-react'

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
  module_number: number
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

export default function ResourcesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedModule, setSelectedModule] = useState<string>('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  // Load branches on mount
  useEffect(() => {
    async function fetchBranches() {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('name')

        if (error) throw error
        setBranches(data || [])
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [supabase])

  // Load semesters when branch is selected
  useEffect(() => {
    if (!selectedBranch) {
      setSemesters([])
      setSelectedSemester('')
      return
    }

    async function fetchSemesters() {
      try {
        const { data, error } = await supabase
          .from('semesters')
          .select('*')
          .eq('branch_id', selectedBranch)
          .order('semester_number')

        if (error) throw error
        setSemesters(data || [])
      } catch (error) {
        console.error('Error fetching semesters:', error)
      }
    }

    fetchSemesters()
  }, [selectedBranch, supabase])

  // Load subjects when semester is selected
  useEffect(() => {
    if (!selectedSemester) {
      setSubjects([])
      setSelectedSubject('')
      return
    }

    async function fetchSubjects() {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('semester_id', selectedSemester)
          .order('name')

        if (error) throw error
        setSubjects(data || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    }

    fetchSubjects()
  }, [selectedSemester, supabase])

  // Load modules when subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setModules([])
      setSelectedModule('')
      return
    }

    async function fetchModules() {
      try {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('subject_id', selectedSubject)
          .order('module_number')

        if (error) throw error
        setModules(data || [])
      } catch (error) {
        console.error('Error fetching modules:', error)
      }
    }

    fetchModules()
  }, [selectedSubject, supabase])

  // Load resources when module is selected
  useEffect(() => {
    if (!selectedModule) {
      setResources([])
      return
    }

    async function fetchResources() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('module_id', selectedModule)
          .order('created_at', { ascending: false })

        if (error) throw error
        setResources(data || [])
      } catch (error) {
        console.error('Error fetching resources:', error)
      }
    }

    fetchResources()
  }, [selectedModule, supabase])

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId)
    setSelectedSemester('')
    setSelectedSubject('')
    setSelectedModule('')
  }

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemester(semesterId)
    setSelectedSubject('')
    setSelectedModule('')
  }

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setSelectedModule('')
  }

  const handleModuleChange = (moduleId: string) => {
    setSelectedModule(moduleId)
  }

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
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Resources</h2>
          <p className="mt-2 text-sm text-secondary-text">
            Browse curated, exam-focused resources organized by branch, semester, subject, and module.
          </p>
        </div>

        {/* Hierarchical filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
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
                disabled={!selectedBranch}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">Select Semester</option>
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
                disabled={!selectedSemester}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">Select Subject</option>
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
                disabled={!selectedSubject}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>Module {module.module_number}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid */}
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </motion.div>
        )}

        {selectedModule && resources.length === 0 && (
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <p className="text-secondary-text">No resources found for this module.</p>
          </div>
        )}

        {!selectedModule && (
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <p className="text-secondary-text">Select a module to view resources.</p>
          </div>
        )}
      </div>
    </section>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
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
        {resource.file_url && (
          <a
            href={resource.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        )}

        {resource.youtube_link && (
          <a
            href={resource.youtube_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 glass border border-white/10 rounded-lg hover:border-cyan-400/50 transition-all text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            Watch Playlist
          </a>
        )}
      </div>
    </motion.div>
  )
}
