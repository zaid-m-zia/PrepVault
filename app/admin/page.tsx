'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { GraduationCap, Calendar, BookOpen, FileText, Upload } from 'lucide-react'

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

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('branches')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      const session = data?.session
      setUser(session?.user || null)

      if (session?.user?.email === 'zaidzia900@gmail.com') {
        setIsAdmin(true)
      }

      setLoading(false)
    }

    checkAuth()
  }, [supabase])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Access Denied</h1>
            <p className="text-secondary-text mb-6">Please log in to access this page.</p>
          </div>
        </div>
      </section>
    )
  }

  if (!isAdmin) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Access Denied</h1>
            <p className="text-secondary-text mb-6">You don't have permission to access this page.</p>
          </div>
        </div>
      </section>
    )
  }

  const tabs = [
    { id: 'branches', label: 'Branches', icon: GraduationCap },
    { id: 'semesters', label: 'Semesters', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Upload },
  ]

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-secondary-text">Manage the hierarchical academic structure and upload resources.</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-white/10">
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                      : 'glass border border-white/10 text-secondary-text hover:border-cyan-400/30 hover:text-primary-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'branches' && <BranchManager />}
          {activeTab === 'semesters' && <SemesterManager />}
          {activeTab === 'subjects' && <SubjectManager />}
          {activeTab === 'modules' && <ModuleManager />}
          {activeTab === 'resources' && <ResourceManager />}
        </div>
      </div>
    </section>
  )
}

function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [newBranchName, setNewBranchName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBranchName.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('branches')
        .insert({ name: newBranchName.trim() })

      if (error) throw error

      setMessage('Branch created successfully!')
      setNewBranchName('')
      fetchBranches()
    } catch (error) {
      console.error('Error creating branch:', error)
      setMessage('Failed to create branch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Create Branch Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Create Branch</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleCreateBranch} className="flex gap-4">
          <input
            type="text"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            placeholder="Branch name (e.g., CSE, ECE, IT)"
            className="flex-1 px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating...' : 'Create Branch'}
          </button>
        </form>
      </div>

      {/* Branches List */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Existing Branches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch.id} className="p-4 glass border border-white/10 rounded-lg">
              <h4 className="font-semibold">{branch.name}</h4>
            </div>
          ))}
        </div>
        {branches.length === 0 && (
          <p className="text-secondary-text text-center py-8">No branches created yet.</p>
        )}
      </div>
    </motion.div>
  )
}

function SemesterManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [semesterNumber, setSemesterNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    }
  }, [selectedBranch])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchSemesters = async () => {
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

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBranch || !semesterNumber) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('semesters')
        .insert({
          branch_id: selectedBranch,
          semester_number: parseInt(semesterNumber)
        })

      if (error) throw error

      setMessage('Semester created successfully!')
      setSemesterNumber('')
      fetchSemesters()
    } catch (error) {
      console.error('Error creating semester:', error)
      setMessage('Failed to create semester. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Create Semester Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Create Semester</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleCreateSemester} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Semester Number</label>
            <input
              type="number"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(e.target.value)}
              placeholder="e.g., 4"
              min="1"
              max="8"
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : 'Create Semester'}
            </button>
          </div>
        </form>
      </div>

      {/* Semesters List */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Existing Semesters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {semesters.map((semester) => (
            <div key={semester.id} className="p-4 glass border border-white/10 rounded-lg">
              <h4 className="font-semibold">Semester {semester.semester_number}</h4>
              <p className="text-sm text-secondary-text">
                Branch: {branches.find(b => b.id === semester.branch_id)?.name}
              </p>
            </div>
          ))}
        </div>
        {semesters.length === 0 && selectedBranch && (
          <p className="text-secondary-text text-center py-8">No semesters created for this branch yet.</p>
        )}
        {!selectedBranch && (
          <p className="text-secondary-text text-center py-8">Select a branch to view semesters.</p>
        )}
      </div>
    </motion.div>
  )
}

function SubjectManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    }
  }, [selectedBranch])

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects()
    }
  }, [selectedSemester])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchSemesters = async () => {
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

  const fetchSubjects = async () => {
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

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSemester || !subjectName.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('subjects')
        .insert({
          semester_id: selectedSemester,
          name: subjectName.trim()
        })

      if (error) throw error

      setMessage('Subject created successfully!')
      setSubjectName('')
      fetchSubjects()
    } catch (error) {
      console.error('Error creating subject:', error)
      setMessage('Failed to create subject. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Create Subject Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Create Subject</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value)
                setSelectedSemester('')
              }}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={!selectedBranch}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>Semester {semester.semester_number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject Name</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g., Data Structures"
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>

      {/* Subjects List */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Existing Subjects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="p-4 glass border border-white/10 rounded-lg">
              <h4 className="font-semibold">{subject.name}</h4>
              <p className="text-sm text-secondary-text">
                Semester: {semesters.find(s => s.id === subject.semester_id)?.semester_number}
              </p>
            </div>
          ))}
        </div>
        {subjects.length === 0 && selectedSemester && (
          <p className="text-secondary-text text-center py-8">No subjects created for this semester yet.</p>
        )}
        {!selectedSemester && (
          <p className="text-secondary-text text-center py-8">Select a semester to view subjects.</p>
        )}
      </div>
    </motion.div>
  )
}

function ModuleManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [moduleNumber, setModuleNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    }
  }, [selectedBranch])

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects()
    }
  }, [selectedSemester])

  useEffect(() => {
    if (selectedSubject) {
      fetchModules()
    }
  }, [selectedSubject])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchSemesters = async () => {
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

  const fetchSubjects = async () => {
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

  const fetchModules = async () => {
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

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !moduleNumber) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('modules')
        .insert({
          subject_id: selectedSubject,
          module_number: parseInt(moduleNumber)
        })

      if (error) throw error

      setMessage('Module created successfully!')
      setModuleNumber('')
      fetchModules()
    } catch (error) {
      console.error('Error creating module:', error)
      setMessage('Failed to create module. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Create Module Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Create Module</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleCreateModule} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value)
                setSelectedSemester('')
                setSelectedSubject('')
              }}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
              required
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                setSelectedSubject('')
              }}
              disabled={!selectedBranch}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>Semester {semester.semester_number}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedSemester}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Module Number</label>
            <input
              type="number"
              value={moduleNumber}
              onChange={(e) => setModuleNumber(e.target.value)}
              placeholder="e.g., 1"
              min="1"
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>

      {/* Modules List */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Existing Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <div key={module.id} className="p-4 glass border border-white/10 rounded-lg">
              <h4 className="font-semibold">Module {module.module_number}</h4>
              <p className="text-sm text-secondary-text">
                Subject: {subjects.find(s => s.id === module.subject_id)?.name}
              </p>
            </div>
          ))}
        </div>
        {modules.length === 0 && selectedSubject && (
          <p className="text-secondary-text text-center py-8">No modules created for this subject yet.</p>
        )}
        {!selectedSubject && (
          <p className="text-secondary-text text-center py-8">Select a subject to view modules.</p>
        )}
      </div>
    </motion.div>
  )
}

function ResourceManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resourceType: '',
    youtubeLink: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    }
  }, [selectedBranch])

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects()
    }
  }, [selectedSemester])

  useEffect(() => {
    if (selectedSubject) {
      fetchModules()
    }
  }, [selectedSubject])

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchSemesters = async () => {
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

  const fetchSubjects = async () => {
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

  const fetchModules = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule) return

    setUploading(true)
    setMessage('')

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        throw new Error('Not authenticated')
      }

      let fileUrl = ''

      // Upload PDF if provided
      if (file) {
        const fileName = `${Date.now()}-${file.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(`pdfs/${fileName}`, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(`pdfs/${fileName}`)

        fileUrl = publicUrl
      }

      // Save resource metadata
      const { error: insertError } = await supabase
        .from('resources')
        .insert({
          module_id: selectedModule,
          title: formData.title,
          description: formData.description,
          resource_type: formData.resourceType,
          file_url: fileUrl || null,
          youtube_link: formData.youtubeLink || null,
          created_by: session.session.user.id
        })

      if (insertError) throw insertError

      setMessage('Resource uploaded successfully!')
      setFormData({
        title: '',
        description: '',
        resourceType: '',
        youtubeLink: ''
      })
      setFile(null)

    } catch (error) {
      console.error('Upload error:', error)
      setMessage('Failed to upload resource. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Upload Resource Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Upload Resource</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hierarchical selectors */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value)
                  setSelectedSemester('')
                  setSelectedSubject('')
                  setSelectedModule('')
                }}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value)
                  setSelectedSubject('')
                  setSelectedModule('')
                }}
                disabled={!selectedBranch}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
                required
              >
                <option value="">Select Semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>Semester {semester.semester_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value)
                  setSelectedModule('')
                }}
                disabled={!selectedSemester}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                disabled={!selectedSubject}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text disabled:opacity-50"
                required
              >
                <option value="">Select Module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>Module {module.module_number}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resource details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                placeholder="Resource title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resource Type</label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
              >
                <option value="">Select type</option>
                <option value="Notes">Notes</option>
                <option value="PYQ">PYQ</option>
                <option value="Assignment">Assignment</option>
                <option value="Playlist">Playlist</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text resize-none"
              placeholder="Describe the resource"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">PDF Upload</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">YouTube Playlist Link (Optional)</label>
              <input
                type="url"
                name="youtubeLink"
                value={formData.youtubeLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                placeholder="https://youtube.com/playlist?list=..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedModule}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              'Upload Resource'
            )}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
