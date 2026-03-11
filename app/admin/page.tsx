'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { GraduationCap, Calendar, BookOpen, FileText, Upload, UploadCloud, CalendarPlus } from 'lucide-react'

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
}

// Create Supabase client outside component to prevent recreation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('branches')

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
  }, [])

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
    { id: 'bulk-upload', label: 'Bulk Upload', icon: UploadCloud },
    { id: 'events', label: 'Events', icon: CalendarPlus },
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
          {activeTab === 'bulk-upload' && <BulkUploadManager />}
          {activeTab === 'events' && <EventManager />}
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
  const [fetchLoading, setFetchLoading] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchBranchesForBranch()
  }, [])

  const fetchBranchesForBranch = async () => {
    try {
      setFetchLoading(true)
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      setMessage('Failed to load branches')
    } finally {
      setFetchLoading(false)
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
      fetchBranchesForBranch()
    } catch (error) {
      console.error('Error creating branch:', error)
      setMessage('Failed to create branch. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm("Are you sure you want to delete this branch?")) return

    setDeleteSuccess('')
    setDeleteError('')

    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId)

      if (error) throw error

      setDeleteSuccess('Branch deleted successfully!')
      fetchBranchesForBranch()
    } catch (error) {
      console.error('Error deleting branch:', error)
      setDeleteError('Failed to delete branch. Please try again.')
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

        {/* Delete Success Message */}
        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{deleteSuccess}</p>
          </div>
        )}

        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{deleteError}</p>
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
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{branch.name}</h4>
                <button
                  onClick={() => handleDeleteBranch(branch.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
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
  const [fetchLoading, setFetchLoading] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchBranchesForSemester()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    } else {
      setSemesters([])
    }
  }, [selectedBranch])

  const fetchBranchesForSemester = async () => {
    try {
      setFetchLoading(true)
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      setMessage('Failed to load branches')
    } finally {
      setFetchLoading(false)
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
      setMessage('Failed to load semesters')
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

  const handleDeleteSemester = async (semesterId: string) => {
    if (!confirm("Are you sure you want to delete this semester?")) return

    setDeleteSuccess('')
    setDeleteError('')

    try {
      const { error } = await supabase
        .from('semesters')
        .delete()
        .eq('id', semesterId)

      if (error) throw error

      setDeleteSuccess('Semester deleted successfully!')
      fetchSemesters()
    } catch (error) {
      console.error('Error deleting semester:', error)
      setDeleteError('Failed to delete semester. Please try again.')
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

        {/* Delete Success Message */}
        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{deleteSuccess}</p>
          </div>
        )}

        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{deleteError}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Semester {semester.semester_number}</h4>
                  <p className="text-sm text-secondary-text">
                    Branch: {branches.find(b => b.id === semester.branch_id)?.name}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSemester(semester.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
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
  const [fetchLoading, setFetchLoading] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchBranchesForSubject()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    } else {
      setSemesters([])
      setSelectedSemester('')
    }
  }, [selectedBranch])

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects()
    } else {
      setSubjects([])
    }
  }, [selectedSemester])

  const fetchBranchesForSubject = async () => {
    try {
      setFetchLoading(true)
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      setMessage('Failed to load branches')
    } finally {
      setFetchLoading(false)
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
      setMessage('Failed to load semesters')
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
      setMessage('Failed to load subjects')
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

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return

    setDeleteSuccess('')
    setDeleteError('')

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId)

      if (error) throw error

      setDeleteSuccess('Subject deleted successfully!')
      fetchSubjects()
    } catch (error) {
      console.error('Error deleting subject:', error)
      setDeleteError('Failed to delete subject. Please try again.')
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

        {/* Delete Success Message */}
        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{deleteSuccess}</p>
          </div>
        )}

        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{deleteError}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{subject.name}</h4>
                  <p className="text-sm text-secondary-text">
                    Semester: {semesters.find(s => s.id === subject.semester_id)?.semester_number}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSubject(subject.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
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
  const [moduleName, setModuleName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [fetchLoading, setFetchLoading] = useState(true)
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchBranchesForModule()
  }, [])

  useEffect(() => {
    if (selectedBranch) {
      fetchSemesters()
    } else {
      setSemesters([])
      setSelectedSemester('')
    }
  }, [selectedBranch])

  useEffect(() => {
    if (selectedSemester) {
      fetchSubjects()
    } else {
      setSubjects([])
      setSelectedSubject('')
    }
  }, [selectedSemester])

  useEffect(() => {
    if (selectedSubject) {
      fetchModules()
    } else {
      setModules([])
    }
  }, [selectedSubject])

  const fetchBranchesForModule = async () => {
    try {
      setFetchLoading(true)
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

      if (error) throw error
      setBranches(data || [])
    } catch (error) {
      console.error('Error fetching branches:', error)
      setMessage('Failed to load branches')
    } finally {
      setFetchLoading(false)
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
      setMessage('Failed to load semesters')
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
      setMessage('Failed to load subjects')
    }
  }

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('subject_id', selectedSubject)
        .order('module_name')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
      setMessage('Failed to load modules')
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !moduleName) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('modules')
        .insert({
          subject_id: selectedSubject,
          module_name: moduleName
        })

      if (error) throw error

      setMessage('Module created successfully!')
      setModuleName('')
      fetchModules()
    } catch (error) {
      console.error('Error creating module:', error)
      setMessage('Failed to create module. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return

    setDeleteSuccess('')
    setDeleteError('')

    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId)

      if (error) throw error

      setDeleteSuccess('Module deleted successfully!')
      fetchModules()
    } catch (error) {
      console.error('Error deleting module:', error)
      setDeleteError('Failed to delete module. Please try again.')
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

        {/* Delete Success Message */}
        {deleteSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{deleteSuccess}</p>
          </div>
        )}

        {/* Delete Error Message */}
        {deleteError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{deleteError}</p>
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
            <label className="block text-sm font-medium mb-2">Module Name</label>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="e.g., Introduction"
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{module.module_name}</h4>
                  <p className="text-sm text-secondary-text">
                    Subject: {subjects.find(s => s.id === module.subject_id)?.name}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteModule(module.id)}
                  className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Delete
                </button>
              </div>
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
  const [uploadSuccess, setUploadSuccess] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [resources, setResources] = useState<any[]>([])

  useEffect(() => {
    fetchBranchesForResource()
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

  useEffect(() => {
    fetchResources()
  }, [selectedModule])

  const fetchBranchesForResource = async () => {
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
        .select('id, module_name, subject_id')
        .eq('subject_id', selectedSubject)
        .order('module_name')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const fetchResources = async () => {
    if (!selectedModule) {
      setResources([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('module_id', selectedModule)
        .order('title')

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous messages
    setUploadSuccess('')
    setUploadError('')

    // STEP 1: Validate input
    if (!selectedModule) {
      setUploadError("Please select a module first")
      return
    }

    // Different validation for Playlist vs other types
    if (formData.resourceType === "Playlist") {
      if (!formData.youtubeLink) {
        setUploadError("Please add a YouTube playlist link")
        return
      }
    } else {
      if (!file) {
        setUploadError("Please select a file")
        return
      }
    }

    console.log("Uploading module:", selectedModule)
    console.log("Resource type:", formData.resourceType)

    setUploading(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.user) {
        throw new Error('Not authenticated')
      }

      let publicUrl = null

      // CASE 1: Playlist - Skip file upload
      if (formData.resourceType === "Playlist") {
        console.log("Playlist detected - skipping file upload")
        console.log("youtube_link:", formData.youtubeLink)
      } else {
        // CASE 2: File-based resources - Upload to storage
        console.log("Uploading file:", file)

        // STEP 2: Upload file to Supabase storage
        const filePath = `${selectedModule}/${Date.now()}_${file!.name}`

        console.log("File path:", filePath)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, file!)

        if (uploadError) {
          console.error("Supabase Storage Upload Error:", uploadError)
          setUploadError("File Upload Error: " + uploadError.message)
          return
        }

        // STEP 3: Generate public URL
        const { data: urlData } = supabase.storage
          .from("resources")
          .getPublicUrl(filePath)

        publicUrl = urlData.publicUrl
        console.log("Public URL:", publicUrl)
      }

      // STEP 4: Insert row into database
      console.log("module_id:", selectedModule)
      console.log("title:", formData.title)
      console.log("file_url:", publicUrl)
      console.log("youtube_link:", formData.youtubeLink)

      const { error: dbError } = await supabase
        .from("resources")
        .insert({
          module_id: selectedModule,
          title: formData.title,
          description: formData.description,
          resource_type: formData.resourceType,
          file_url: publicUrl,
          youtube_link: formData.youtubeLink || null
        })

      if (dbError) {
        console.error("Supabase Insert Error:", dbError)
        setUploadError("Database Error: " + dbError.message)
        return
      }

      // STEP 5: Show success message
      const successMessage = formData.resourceType === "Playlist" 
        ? "Playlist added successfully" 
        : "Resource uploaded successfully"
      setUploadSuccess(successMessage)
      setUploadError('')

      // STEP 6: Reset form fields
      setFormData({
        title: '',
        description: '',
        resourceType: '',
        youtubeLink: ''
      })
      setFile(null)

      // Refresh resources list after successful upload
      await fetchResources()

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

  const handleDeleteResource = async (resourceId: string, fileUrl: string | null) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    setDeleteSuccess('')
    setDeleteError('')

    try {
      // Delete file from storage only if fileUrl exists (not a playlist)
      if (fileUrl) {
        const urlParts = fileUrl.split('/')
        const filePath = urlParts.slice(-2).join('/') // Get the last two parts (moduleId/filename)

        const { error: storageError } = await supabase.storage
          .from("resources")
          .remove([filePath])

        if (storageError) {
          console.error("Storage deletion error:", storageError)
          // Continue with database deletion even if storage deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)

      if (dbError) throw dbError

      setDeleteSuccess('Resource deleted successfully!')
      fetchResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      setDeleteError('Failed to delete resource. Please try again.')
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

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400">{uploadSuccess}</p>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{uploadError}</p>
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
                  <option key={module.id} value={module.id}>{module.module_name}</option>
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
              <label className="block text-sm font-medium mb-2">
                {formData.resourceType === "Playlist" ? "PDF Upload (Not Required)" : "PDF Upload"}
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={formData.resourceType === "Playlist"}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.resourceType === "Playlist" ? "YouTube Playlist Link (Required)" : "YouTube Playlist Link (Optional)"}
              </label>
              <input
                type="url"
                name="youtubeLink"
                value={formData.youtubeLink}
                onChange={handleInputChange}
                required={formData.resourceType === "Playlist"}
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
                {formData.resourceType === "Playlist" ? "Adding..." : "Uploading..."}
              </>
            ) : (
              formData.resourceType === "Playlist" ? "Add Playlist" : "Upload Resource"
            )}
          </button>
        </form>
      </div>

      {/* Delete Success Message */}
      {deleteSuccess && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400">{deleteSuccess}</p>
        </div>
      )}

      {/* Delete Error Message */}
      {deleteError && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400">{deleteError}</p>
        </div>
      )}

      {/* Existing Resources List */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Existing Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div key={resource.id} className="p-4 glass border border-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{resource.title}</h4>
                  <p className="text-sm text-secondary-text truncate">
                    {resource.resource_type}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteResource(resource.id, resource.file_url)}
                  className="ml-2 px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {resources.length === 0 && selectedModule && (
          <p className="text-secondary-text text-center py-8">No resources uploaded for this module yet.</p>
        )}
        {!selectedModule && (
          <p className="text-secondary-text text-center py-8">Select a module to view resources.</p>
        )}
      </div>
    </motion.div>
  )
}

function BulkUploadManager() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    fetchBranchesForBulkUpload()
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

  const fetchBranchesForBulkUpload = async () => {
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
        .select('id, module_name, subject_id')
        .eq('subject_id', selectedSubject)
        .order('module_name')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule || !files || !resourceType) return

    setUploading(true)
    setProgress('')
    setMessage('')
    setErrors([])

    const { data: session } = await supabase.auth.getSession()
    if (!session?.session?.user) {
      setMessage('Not authenticated')
      setUploading(false)
      return
    }

    const totalFiles = files.length
    let successCount = 0
    let errorMessages: string[] = []

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i]
      setProgress(`Uploading ${i + 1}/${totalFiles}: ${file.name}`)

      try {
        // Generate file path
        const branchName = branches.find(b => b.id === selectedBranch)?.name || 'Unknown'
        const semester = semesters.find(s => s.id === selectedSemester)?.semester_number || '0'
        const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'Unknown'
        const module = modules.find(m => m.id === selectedModule)?.module_name || 'Unknown'
        const timestamp = Date.now()
        const fileName = `${timestamp}-${file.name}`

        const filePath = `resources/${branchName}/${semester}/${subjectName}/${module}/${fileName}`

        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath)

        // Generate title from filename (remove extension)
        const title = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ')

        // Insert database record
        const { error: insertError } = await supabase
          .from('resources')
          .insert({
            module_id: selectedModule,
            title: title,
            description: `${resourceType} for ${subjectName} - ${module}`,
            resource_type: resourceType,
            file_url: publicUrl,
            youtube_link: null
          })

        if (insertError) throw insertError

        successCount++

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        errorMessages.push(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    setProgress('')
    setUploading(false)

    if (successCount === totalFiles) {
      setMessage(`Bulk upload successful! ${successCount} files uploaded.`)
      setFiles(null)
      // Reset form
      setSelectedBranch('')
      setSelectedSemester('')
      setSelectedSubject('')
      setSelectedModule('')
      setResourceType('')
    } else {
      setMessage(`Upload completed with issues. ${successCount}/${totalFiles} files uploaded successfully.`)
      setErrors(errorMessages)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Bulk Upload Form */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Bulk Upload Resources</h3>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('successful') && !message.includes('issues') ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {progress && (
          <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm">{progress}</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <h4 className="font-semibold mb-2">Upload Errors:</h4>
            <ul className="text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
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
                  <option key={module.id} value={module.id}>{module.module_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resource Type and File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
                required
              >
                <option value="">Select type</option>
                <option value="Notes">Notes</option>
                <option value="PYQ">PYQ</option>
                <option value="Assignment">Assignment</option>
                <option value="PPT">PPT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">PDF Files (Multiple)</label>
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                required
              />
              {files && (
                <p className="text-sm text-secondary-text mt-2">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedModule || !files || !resourceType}
            className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              `Upload ${files ? files.length : 0} Files`
            )}
          </button>
        </form>
      </div>

      {/* Upload Information */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-display font-bold mb-4">Upload Information</h3>
        <div className="space-y-3 text-sm text-secondary-text">
          <p><strong>File Path Format:</strong> resources/{'{Branch}'}/{'{Semester}'}/{'{Subject}'}/{'{Module}'}/{'{timestamp-filename}'}</p>
          <p><strong>Example:</strong> resources/IT/4/DBMS/1/1712345678-dbms-pyq.pdf</p>
          <p><strong>Title Generation:</strong> Automatically created from filename (removes .pdf extension)</p>
          <p><strong>Description:</strong> Auto-generated as "{resourceType} for {'{Subject}'} - Module {'{Module}'}"</p>
          <p><strong>Error Handling:</strong> Failed uploads are skipped, successful ones continue</p>
        </div>
      </div>
    </motion.div>
  )
}

  function EventManager() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [message, setMessage] = useState('')

    const [title, setTitle] = useState('')
    const [organizer, setOrganizer] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('')
    const [mode, setMode] = useState('')
    const [college, setCollege] = useState('')
    const [location, setLocation] = useState('')
    const [eventDate, setEventDate] = useState('')
    const [registrationLink, setRegistrationLink] = useState('')
    const [company, setCompany] = useState('')
    const [duration, setDuration] = useState('')
    const [stipend, setStipend] = useState('')
    const [skills, setSkills] = useState('')
    const [deadline, setDeadline] = useState('')
    const [role, setRole] = useState('')
    const [organization, setOrganization] = useState('')
    const [eligibility, setEligibility] = useState('')
    const [internshipPdf, setInternshipPdf] = useState<File | null>(null)

    useEffect(() => {
      fetchEvents()
    }, [])

    useEffect(() => {
      if (category !== 'Internship') {
        setCompany('')
        setDuration('')
        setStipend('')
        setSkills('')
        setDeadline('')
        setRole('')
        setOrganization('')
        setEligibility('')
        setInternshipPdf(null)
      }
    }, [category])

    const fetchEvents = async () => {
      setFetchLoading(true)
      const { data } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
      setEvents(data ?? [])
      setFetchLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!category) return

      setLoading(true)
      setMessage('')

      let error: any = null

      if (category === 'Internship') {
        if (!role.trim() || !organization.trim() || !eligibility.trim() || !skills.trim() || !deadline || !registrationLink.trim()) {
          setLoading(false)
          setMessage('Please fill all required internship fields.')
          return
        }

        if (!internshipPdf) {
          setLoading(false)
          setMessage('Please select a PDF file for the internship.')
          return
        }

        const isPdf = internshipPdf.type === 'application/pdf' || internshipPdf.name.toLowerCase().endsWith('.pdf')
        if (!isPdf) {
          setLoading(false)
          setMessage('Only PDF files are allowed for internship upload.')
          return
        }

        let pdfUrl: string | null = null

        const filePath = `internships/${Date.now()}-${internshipPdf.name}`

        const { error: uploadError } = await supabase.storage
          .from('internship_docs')
          .upload(filePath, internshipPdf, {
            contentType: 'application/pdf',
            upsert: false,
          })

        if (uploadError) {
          console.error('Internship PDF upload error:', uploadError)
          setLoading(false)
          setMessage(uploadError.message || 'Failed to upload internship PDF.')
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('internship_docs')
          .getPublicUrl(filePath)

        pdfUrl = publicUrlData.publicUrl

        const response = await supabase.from('events').insert({
          category: 'Internship',
          role: role.trim(),
          organization: organization.trim(),
          stipend: stipend.trim() || null,
          eligibility: eligibility.trim(),
          skills: skills.trim(),
          deadline,
          pdf_url: pdfUrl,
          registration_link: registrationLink.trim(),
          mode: mode || null,
          duration: duration.trim() || null,
          title: role.trim(),
          organizer: organization.trim(),
          description: description.trim() || null,
          company: organization.trim(),
          event_date: null,
          college: college.trim() || null,
          location: location.trim() || null,
        })

        error = response.error
      } else {
        if (!title.trim() || !organizer.trim() || !mode || !college.trim() || !eventDate) {
          setLoading(false)
          setMessage('Please fill all required event fields.')
          return
        }

        const response = await supabase.from('events').insert({
          title: title.trim(),
          organizer: organizer.trim(),
          description: description.trim() || null,
          category,
          mode,
          college: college.trim(),
          location: location.trim() || null,
          event_date: eventDate,
          registration_link: registrationLink.trim() || null,
        })

        error = response.error
      }

      if (error) {
        setMessage(error.message || 'Failed to create event.')
      } else {
        setMessage(category === 'Internship' ? 'Internship created successfully' : 'Event created successfully!')
        setTitle('')
        setOrganizer('')
        setDescription('')
        setCategory('')
        setMode('')
        setCollege('')
        setLocation('')
        setEventDate('')
        setRegistrationLink('')
        setCompany('')
        setDuration('')
        setStipend('')
        setSkills('')
        setDeadline('')
        setRole('')
        setOrganization('')
        setEligibility('')
        setInternshipPdf(null)
        fetchEvents()
      }
      setLoading(false)
    }

    const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this event?')) return
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (!error) fetchEvents()
    }

    const CATEGORIES = ['Hackathon', 'Tech Fest', 'Competition', 'Coding Challenge', 'Conference', 'Tech Workshop', 'Internship']
    const MODES = ['Online', 'Offline', 'Hybrid']
    const isInternship = category === 'Internship'

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Create Event Form */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-display font-bold mb-4">Manage Events</h3>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-secondary-text mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text bg-transparent"
                  required
                >
                  <option value="" disabled className="bg-[#0a0e27]">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0a0e27]">{c}</option>)}
                </select>
              </div>

              {isInternship ? (
                <>
                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Role *</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Software Engineer Intern"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Organization *</label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Company / Organization"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Salary / Stipend</label>
                    <input
                      type="text"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      placeholder="e.g. ₹80,000/month"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Mode *</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text bg-transparent"
                      required
                    >
                      <option value="" disabled className="bg-[#0a0e27]">Select mode</option>
                      {MODES.map((m) => <option key={m} value={m} className="bg-[#0a0e27]">{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 3 Months"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Deadline to Apply *</label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-secondary-text mb-1">Eligibility Criteria *</label>
                    <input
                      type="text"
                      value={eligibility}
                      onChange={(e) => setEligibility(e.target.value)}
                      placeholder="e.g. 3rd year CS students"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-secondary-text mb-1">Skills Required *</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. DSA, Python, System Design"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">PDF Upload</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setInternshipPdf(e.target.files?.[0] ?? null)}
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Application Link *</label>
                    <input
                      type="url"
                      value={registrationLink}
                      onChange={(e) => setRegistrationLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City / Remote"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">College (optional)</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Used for college filters"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Event title"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Organizer *</label>
                    <input
                      type="text"
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                      placeholder="Organizing team or club"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Mode *</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text bg-transparent"
                      required
                    >
                      <option value="" disabled className="bg-[#0a0e27]">Select mode</option>
                      {MODES.map((m) => <option key={m} value={m} className="bg-[#0a0e27]">{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">College / Institution *</label>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. Amity University"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Location / Venue</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, venue, or 'Online'"
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Event Date *</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-secondary-text mb-1">Registration Link</label>
                    <input
                      type="url"
                      value={registrationLink}
                      onChange={(e) => setRegistrationLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text"
                    />
                  </div>
                </>
              )}
            </div>

            {!isInternship && (
              <div>
                <label className="block text-sm text-secondary-text mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief event description..."
                  rows={3}
                  className="w-full px-4 py-3 glass border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/50 text-primary-text placeholder-secondary-text resize-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating...' : isInternship ? 'Create Internship' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* Events List */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-display font-bold mb-4">Existing Events</h3>
          {fetchLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-white/10 rounded-lg" />)}
            </div>
          ) : events.length === 0 ? (
            <p className="text-secondary-text text-center py-8">No events created yet.</p>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between p-4 glass border border-white/10 rounded-lg">
                  <div>
                    <p className="font-semibold">{ev.title}</p>
                    <p className="text-sm text-secondary-text">{ev.organizer} · {ev.mode} · {ev.category}</p>
                    <p className="text-xs text-secondary-text">
                      {ev.category === 'Internship'
                        ? `Deadline: ${ev.deadline ? new Date(ev.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}`
                        : (ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(ev.id)}
                    className="px-3 py-1 text-sm bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
