'use client'

import { useCallback, useEffect, useState } from 'react'
import { subDays, format } from 'date-fns'
import supabase from '@/lib/supabaseClient'

interface HeatmapData {
  [date: string]: number
}

export default function ContributionHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({})
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)

  const fetchProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_module_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)

      if (error) {
        console.error('Heatmap fetch error:', error)
        return
      }

      processHeatmapData(data)
    } catch (err) {
      console.error('Heatmap error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // STEP 1: FETCH DATA
  useEffect(() => {
    void fetchProgress()
  }, [fetchProgress])

  useEffect(() => {
    const refresh = () => { void fetchProgress() }

    window.addEventListener('progressUpdated', refresh)

    return () => {
      window.removeEventListener('progressUpdated', refresh)
    }
  }, [fetchProgress])

  // STEP 2: PROCESS DATA - Group modules per day
  function processHeatmapData(data: any[]) {
    const counts: HeatmapData = {}

    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0]
      if (!counts[date]) counts[date] = 0
      counts[date] += 1
    })

    setHeatmapData(counts)

    // STEP 7: Calculate streak
    const calculatedStreak = calculateStreak(counts)
    setStreak(calculatedStreak)
  }

  // STEP 7: Helper - Calculate current streak
  function calculateStreak(data: HeatmapData): number {
    let streak = 0
    let today = new Date()

    while (true) {
      const date = today.toISOString().split('T')[0]
      if (data[date]) {
        streak++
        today.setDate(today.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // STEP 3: Generate last 90 days
  const days = Array.from({ length: 90 })
    .map((_, i) => {
      const date = subDays(new Date(), i)
      return format(date, 'yyyy-MM-dd')
    })
    .reverse()

  // STEP 4: Color logic based on completion count
  function getColor(count: number): string {
    if (!count) return 'bg-gray-200 dark:bg-gray-800'
    if (count === 1) return 'bg-blue-200 dark:bg-blue-900'
    if (count === 2) return 'bg-blue-400 dark:bg-blue-700'
    if (count >= 3) return 'bg-blue-600 dark:bg-blue-500'
    return 'bg-gray-200 dark:bg-gray-800'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Streak</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your daily learning activity (last 90 days)
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800">
            <span className="text-xl">🔥</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">{streak} day streak</span>
          </div>
        )}
      </div>

      {/* STEP 8: Responsive heatmap grid */}
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* STEP 5: UI Grid */}
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
            {days.map(date => {
              const count = heatmapData[date] || 0
              const displayDate = new Date(date)
              const dateDisplay = format(displayDate, 'MMM d')

              return (
                <div
                  key={date}
                  className="group relative"
                  title={`${count} module${count !== 1 ? 's' : ''} on ${dateDisplay}`}
                >
                  <div
                    className={`w-4 h-4 rounded-sm ${getColor(count)} transition-all duration-200 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500 dark:hover:ring-blue-400 cursor-pointer transform hover:scale-125`}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-10">
                    <div className="bg-gray-900 dark:bg-gray-950 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{dateDisplay}</div>
                      <div className="text-gray-300">
                        {count} module{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center gap-4 text-xs">
        <span className="text-gray-600 dark:text-gray-400">Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-gray-200 dark:bg-gray-800"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-200 dark:bg-blue-900"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-400 dark:bg-blue-700"></div>
          <div className="w-4 h-4 rounded-sm bg-blue-600 dark:bg-blue-500"></div>
        </div>
        <span className="text-gray-600 dark:text-gray-400">More</span>
      </div>
    </div>
  )
}
