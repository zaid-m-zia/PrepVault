'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import supabase from '../../lib/supabaseClient'

type SearchSubjectRow = {
  id: string
  name: string
  semester_id: string
}

type SearchModuleRow = {
  id: string
  module_name: string
  subject_id: string
}

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('people')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: 'people', label: 'People' },
    { id: 'resources', label: 'Resources' },
    { id: 'events', label: 'Events' },
    { id: 'hackhub', label: 'HackHub' },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function normalizeQuery(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const rawQuery = query.trim()
    if (!rawQuery) return

    if (category === 'resources') {
      const normalizedQuery = normalizeQuery(rawQuery)

      try {
        const [{ data: subjectData }, { data: moduleData }, { data: authData }] = await Promise.all([
          supabase
            .from('subjects')
            .select('id, name, semester_id')
            .textSearch('search_vector', normalizedQuery, { type: 'plain' })
            .limit(25),
          supabase
            .from('modules')
            .select('id, module_name, subject_id')
            .textSearch('search_vector', normalizedQuery, { type: 'plain' })
            .limit(25),
          supabase.auth.getUser(),
        ])

        let userBranch: string | null = null
        const userId = authData?.user?.id

        if (userId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('branch')
            .eq('id', userId)
            .single()

          userBranch = profileData?.branch ?? null
        }

        const subjects = (subjectData ?? []) as SearchSubjectRow[]
        const modules = (moduleData ?? []) as SearchModuleRow[]

        let selectedSubject: { id: string; semester_id: string } | null =
          subjects.length > 0 ? { id: subjects[0].id, semester_id: subjects[0].semester_id } : null

        if (selectedSubject && userBranch && subjects.length > 1) {
          const scoredSubjects = subjects
            .map((subject) => ({
              id: subject.id,
              semester_id: subject.semester_id,
            }))

          const semesterIds = scoredSubjects.map((subject) => subject.semester_id)
          const { data: semesterData } = await supabase
            .from('semesters')
            .select('id, branch_id')
            .in('id', semesterIds)

          const semesterRows = (semesterData ?? []) as Array<{ id: string; branch_id: string }>

          const preferred = scoredSubjects.find((subject) =>
            semesterRows.some(
              (semester) => semester.id === subject.semester_id && semester.branch_id === userBranch
            )
          )

          if (preferred) {
            selectedSubject = preferred
          }
        }

        // Prefer module match over subject match when both exist.
        if (modules.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(modules[0].id)}`)
        } else if (selectedSubject) {
          router.push(`/resources?subject=${encodeURIComponent(selectedSubject.id)}`)
        } else {
          router.push(`/search?type=resources&query=${encodeURIComponent(rawQuery)}&fallback=1`)
        }
      } catch (error) {
        console.error('Resource search failed:', error)
        router.push(`/search?type=resources&query=${encodeURIComponent(rawQuery)}&fallback=1`)
      }

      setQuery('')
      setOpen(false)
      return
    }

    router.push(`/search?type=${category}&query=${encodeURIComponent(rawQuery)}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2">
      <div className="relative w-full" ref={containerRef}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search engineers, resources, events, hackathons..."
            className="w-full h-11 px-5 pr-10 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          />
          <Search size={16} className="absolute right-3 top-3.5 text-secondary-text pointer-events-none" />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 w-full z-50 glass rounded-lg border border-slate-700 shadow-lg p-2"
            >
              <div className="flex gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex-1 ${
                      category === cat.id
                        ? 'bg-accent text-[#0a0e27]'
                        : 'bg-white/5 text-secondary-text hover:bg-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
