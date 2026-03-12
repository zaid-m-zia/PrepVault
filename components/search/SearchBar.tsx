'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import supabase from '../../lib/supabaseClient'
import { normalizeOpportunitySearchInput } from '../../lib/opportunityUtils'

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

type SearchResourceRow = {
  id: string
  module_id: string
  title: string | null
  description: string | null
}

export default function SearchBar({ className = 'hidden md:flex items-center gap-2' }: { className?: string }) {
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

  function hasLearningIntent(input: string): boolean {
    const learningWords = [
      'learn',
      'study',
      'teach',
      'roadmap',
      'prepare',
      'start',
      'guide',
      'path',
      'prepare',
      'grasp',
      'concepts',
      'understand',
      'me',
      'for',
      'my',
      'exam',
      'on'
    ]

    return learningWords.some((word) => input.toLowerCase().includes(word))
  }

  function cleanSearchQuery(input: string): string {
    const fillerWords = [
      'i',
      'want',
      'to',
      'learn',
      'study',
      'teach',
      'me',
      'show',
      'find',
      'please',
      'how',
      'can',
      'resources',
      'about',
      'for',
      'understand',
      'help',
      'please',
      'explain',
      'notes',
      'ppt',
      'playlist',
      'what',
      'fully',
      'completely',
      
    ]

    const words = input
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word && !fillerWords.includes(word))

    return words.join(' ')
  }

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
      const learningIntent = hasLearningIntent(rawQuery)
      const cleanedInput = cleanSearchQuery(rawQuery)
      const searchQueryText = cleanedInput || rawQuery
      const normalizedQuery = normalizeQuery(searchQueryText)

      if (!normalizedQuery.trim()) {
        router.push(`/search?type=resources&query=${encodeURIComponent(rawQuery)}&fallback=1`)
        setQuery('')
        setOpen(false)
        return
      }

      try {
        const [
          { data: moduleData },
          { data: subjectData },
          { data: resourceTitleData },
          { data: resourceDescriptionData },
          { data: authData },
        ] = await Promise.all([
          supabase
            .from('modules')
            .select('id, module_name, subject_id')
            .ilike('module_name', `%${normalizedQuery}%`)
            .limit(25),
          supabase
            .from('subjects')
            .select('id, name, semester_id')
            .or(`name.ilike.%${normalizedQuery}%,alias.ilike.%${normalizedQuery}%`)
            .limit(25),
          supabase
            .from('resources')
            .select('id, module_id, title, description')
            .ilike('title', `%${normalizedQuery}%`)
            .limit(25),
          supabase
            .from('resources')
            .select('id, module_id, title, description')
            .ilike('description', `%${normalizedQuery}%`)
            .limit(25),
          supabase.auth.getUser(),
        ])

        let resolvedSubjectData = subjectData
        if (!resolvedSubjectData) {
          const { data: fallbackSubjectData } = await supabase
            .from('subjects')
            .select('id, name, semester_id')
            .ilike('name', `%${normalizedQuery}%`)
            .limit(25)
          resolvedSubjectData = fallbackSubjectData
        }

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

        const subjects = (resolvedSubjectData ?? []) as SearchSubjectRow[]
        const modules = (moduleData ?? []) as SearchModuleRow[]
        const resourcesByTitle = (resourceTitleData ?? []) as SearchResourceRow[]
        const resourcesByDescription = (resourceDescriptionData ?? []) as SearchResourceRow[]

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

        const encodedQuery = encodeURIComponent(cleanedInput || normalizedQuery)
        const intentQuery = learningIntent ? '&intent=study' : ''

        // Priority: module > subject > resource title > resource description.
        if (modules.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(modules[0].id)}&q=${encodedQuery}${intentQuery}`)
        } else if (selectedSubject) {
          router.push(`/resources?subject=${encodeURIComponent(selectedSubject.id)}&q=${encodedQuery}${intentQuery}`)
        } else if (resourcesByTitle.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(resourcesByTitle[0].module_id)}&q=${encodedQuery}${intentQuery}`)
        } else if (resourcesByDescription.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(resourcesByDescription[0].module_id)}&q=${encodedQuery}${intentQuery}`)
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

    if (category === 'events') {
      const cleanQuery = normalizeOpportunitySearchInput(rawQuery)
      router.push(`/events?search=${encodeURIComponent(cleanQuery || rawQuery)}`)
      setQuery('')
      setOpen(false)
      return
    }

    router.push(`/search?type=${category}&query=${encodeURIComponent(rawQuery)}`)
    setQuery('')
    setOpen(false)
  }

  return (
    <form onSubmit={handleSearch} className={className}>
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
              className="absolute left-0 top-full mt-2 w-full z-50 glass rounded-lg border border-slate-700 shadow-lg p-3"
            >
              <div className="flex gap-3 items-center">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                      category === cat.id
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md'
                        : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white'
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
