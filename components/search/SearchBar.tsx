'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?type=${category}&query=${encodeURIComponent(query)}`)
      setQuery('')
      setOpen(false)
    }
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
