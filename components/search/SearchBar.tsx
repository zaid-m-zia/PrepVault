'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('people')
  const [open, setOpen] = useState(false)

  const categories = [
    { id: 'people', label: 'People' },
    { id: 'resources', label: 'Resources' },
    { id: 'events', label: 'Events' },
    { id: 'hackhub', label: 'HackHub' },
  ]

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
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="px-3 py-2 rounded-md bg-transparent border border-white/6 text-sm w-48 focus:outline-none focus:border-white/20"
        />
        <Search size={16} className="absolute right-3 top-2.5 text-secondary-text pointer-events-none" />
      </div>

      {open && (
        <div className="absolute top-full mt-2 left-0 glass rounded-md border border-white/10 p-2 flex gap-1 z-50">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                category === cat.id
                  ? 'bg-accent text-[#0a0e27]'
                  : 'bg-white/5 text-secondary-text hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
