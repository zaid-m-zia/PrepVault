'use client'

import { Suspense } from 'react'
import SearchResults from '../../components/search/SearchResults'

export default function SearchPage() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-semibold mb-8">Search</h1>
        <Suspense fallback={<div className="text-center py-12 text-secondary-text">Loading...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </section>
  )
}
