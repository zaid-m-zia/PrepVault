'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import Link from 'next/link'
import Avatar from '../ui/Avatar'

type SearchResult = {
  id: string
  username: string
  full_name?: string
  bio?: string
  avatar_url?: string | null
  type?: string
  title?: string
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const searchType = searchParams.get('type') || 'people'
  const query = searchParams.get('query') || ''
  const fallback = searchParams.get('fallback') === '1'
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    async function search() {
      setLoading(true)
      setError(null)

      try {
        if (searchType === 'people') {
          const { data, error: err } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(10)

          if (err) throw err
          setResults(
            data?.map((p: any) => ({
              id: p.id,
              username: p.username,
              full_name: p.full_name,
              bio: p.bio,
              avatar_url: p.avatar_url,
              type: 'people',
            })) || []
          )
        }
      } catch (e) {
        console.error('Search error:', e)
        setError('Failed to search. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [query, searchType])

  if (!query.trim()) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-text">Enter a search query to get started</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-text">Searching...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    if (searchType === 'resources' && fallback) {
      return (
        <div className="text-center py-12">
          <p className="text-secondary-text">No exact match found. Showing closest resources.</p>
        </div>
      )
    }

    return (
      <div className="text-center py-12">
        <p className="text-secondary-text">No results found for "{query}"</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => (
        <Link
          key={result.id}
          href={`/profile/${result.id}`}
          className="glass rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-start gap-4">
            <Avatar
              user={{
                full_name: result.full_name,
                username: result.username,
                avatar_url: result.avatar_url,
              }}
              size="medium"
              className="flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold line-clamp-1">{result.full_name || result.username}</h3>
              <p className="text-sm text-secondary-text line-clamp-1">@{result.username}</p>
            </div>
          </div>
          {result.bio && (
            <p className="mt-3 text-sm text-secondary-text line-clamp-2">{result.bio}</p>
          )}
        </Link>
      ))}
    </div>
  )
}
