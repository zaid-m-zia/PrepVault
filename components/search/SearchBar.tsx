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

  const fillerWords = new Set([
    'i',
    'want',
    'to',
    'learn',
    'study',
    'understand',
    'teach',
    'explain',
    'help',
    'please',
    'guide',
    'me',
    'about',
    'how',
    'can',
    'you',
  ])

  const subjectSynonyms: Record<string, string> = {
    dsa: 'data structures and algorithms',
    dbms: 'database management systems',
    os: 'operating systems',
    cn: 'computer networks',
  }

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

  function cleanLearningQuery(input: string): string {
    const normalized = normalizeQuery(input)
    const expanded = normalized
      .split(' ')
      .filter(Boolean)
      .map((word) => subjectSynonyms[word] ?? word)
      .join(' ')

    const cleaned = expanded
      .split(' ')
      .filter((word) => word && !fillerWords.has(word))

    return cleaned.join(' ').trim()
  }

  function tokenize(input: string): string[] {
    return normalizeQuery(input).split(' ').filter(Boolean)
  }

  function uniqueById<T extends { id: string }>(rows: T[]): T[] {
    const seen = new Set<string>()
    const unique: T[] = []

    for (const row of rows) {
      if (seen.has(row.id)) continue
      seen.add(row.id)
      unique.push(row)
    }

    return unique
  }

  async function runFuzzyLookup(term: string) {
    const [moduleResult, subjectResult, resourceTitleResult, resourceDescriptionResult] = await Promise.all([
      supabase
        .from('modules')
        .select('id, module_name, subject_id')
        .ilike('module_name', `%${term}%`)
        .limit(25),
      supabase
        .from('subjects')
        .select('id, name, semester_id')
        .or(`name.ilike.%${term}%,alias.ilike.%${term}%`)
        .limit(25),
      supabase
        .from('resources')
        .select('id, module_id, title, description')
        .ilike('title', `%${term}%`)
        .limit(25),
      supabase
        .from('resources')
        .select('id, module_id, title, description')
        .ilike('description', `%${term}%`)
        .limit(25),
    ])

    return {
      modules: (moduleResult.data ?? []) as SearchModuleRow[],
      subjects: (subjectResult.data ?? []) as SearchSubjectRow[],
      resourcesByTitle: (resourceTitleResult.data ?? []) as SearchResourceRow[],
      resourcesByDescription: (resourceDescriptionResult.data ?? []) as SearchResourceRow[],
    }
  }

  function scoreSimilarity(candidate: string, topic: string): number {
    const candidateTokens = tokenize(candidate)
    const topicTokens = tokenize(topic)
    if (candidateTokens.length === 0 || topicTokens.length === 0) return 0

    let score = 0

    for (const token of topicTokens) {
      if (candidateTokens.includes(token)) score += 2
      else if (candidateTokens.some((candidateToken) => candidateToken.startsWith(token) || token.startsWith(candidateToken))) score += 1
    }

    if (normalizeQuery(candidate).includes(normalizeQuery(topic))) score += 3
    return score
  }

  async function findClosestSubject(topic: string): Promise<SearchSubjectRow | null> {
    const normalizedTopic = normalizeQuery(topic)
    if (!normalizedTopic) return null

    const { data } = await supabase
      .from('subjects')
      .select('id, name, semester_id')
      .limit(200)

    const subjects = (data ?? []) as SearchSubjectRow[]
    if (subjects.length === 0) return null

    let best: SearchSubjectRow | null = null
    let bestScore = 0

    for (const subject of subjects) {
      const score = scoreSimilarity(subject.name, normalizedTopic)
      if (score > bestScore) {
        bestScore = score
        best = subject
      }
    }

    if (!best || bestScore <= 0) return null
    return best
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const rawQuery = query.trim()
    if (!rawQuery) return

    if (category === 'resources') {
      const cleanedTopic = cleanLearningQuery(rawQuery)
      const searchQueryText = cleanedTopic || normalizeQuery(rawQuery) || rawQuery
      const normalizedQuery = normalizeQuery(searchQueryText)

      if (!normalizedQuery.trim()) {
        router.push(`/resources?q=${encodeURIComponent(rawQuery)}&fallback=subjects`)
        setQuery('')
        setOpen(false)
        return
      }

      try {
        const [primaryLookup, authResult] = await Promise.all([
          runFuzzyLookup(normalizedQuery),
          supabase.auth.getUser(),
        ])

        let userBranch: string | null = null
        const userId = authResult?.data?.user?.id

        if (userId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('branch')
            .eq('id', userId)
            .single()

          userBranch = profileData?.branch ?? null
        }

        let subjects = primaryLookup.subjects
        let modules = primaryLookup.modules
        let resourcesByTitle = primaryLookup.resourcesByTitle
        let resourcesByDescription = primaryLookup.resourcesByDescription

        if (
          subjects.length === 0 &&
          modules.length === 0 &&
          resourcesByTitle.length === 0 &&
          resourcesByDescription.length === 0
        ) {
          const words = normalizedQuery.split(' ').filter((word) => word && word.length > 1)

          if (words.length > 0) {
            const lookupByWord = await Promise.all(words.map((word) => runFuzzyLookup(word)))

            subjects = uniqueById(lookupByWord.flatMap((result) => result.subjects))
            modules = uniqueById(lookupByWord.flatMap((result) => result.modules))
            resourcesByTitle = uniqueById(lookupByWord.flatMap((result) => result.resourcesByTitle))
            resourcesByDescription = uniqueById(lookupByWord.flatMap((result) => result.resourcesByDescription))
          }
        }

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

        const encodedQuery = encodeURIComponent(searchQueryText)

        if (modules.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(modules[0].id)}&q=${encodedQuery}`)
        } else if (selectedSubject) {
          router.push(`/resources?subject=${encodeURIComponent(selectedSubject.id)}&q=${encodedQuery}`)
        } else if (resourcesByTitle.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(resourcesByTitle[0].module_id)}&q=${encodedQuery}`)
        } else if (resourcesByDescription.length > 0) {
          router.push(`/resources?module=${encodeURIComponent(resourcesByDescription[0].module_id)}&q=${encodedQuery}`)
        } else {
          const closestSubject = await findClosestSubject(searchQueryText)

          if (closestSubject) {
            router.push(`/resources?subject=${encodeURIComponent(closestSubject.id)}&q=${encodedQuery}&fallback=closest`)
          } else {
            router.push(`/resources?q=${encodedQuery}&fallback=subjects`)
          }
        }
      } catch (error) {
        console.error('Resource search failed:', error)
        router.push(`/resources?q=${encodeURIComponent(rawQuery)}&fallback=subjects`)
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
            className="w-full h-11 px-5 pr-10 rounded-xl border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400"
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
              className="absolute left-0 top-full mt-2 w-full z-50 glass rounded-lg border border-gray-200 dark:border-slate-700 shadow-lg p-3"
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
                        : 'bg-gray-100 text-slate-700 hover:bg-gray-200 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
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
