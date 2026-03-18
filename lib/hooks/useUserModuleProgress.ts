import { useCallback, useEffect, useMemo, useState } from 'react'
import supabase from '../supabaseClient'

export type ModuleProgressRow = {
  id?: string
  user_id: string
  module_id: string
  subject: string
  completed: boolean
  created_at?: string
  updated_at?: string
}

type UseUserModuleProgressOptions = {
  userId: string | null
  moduleIds: string[]
}

type ToggleOptions = {
  subject: string
}

export function useUserModuleProgress({ userId, moduleIds }: UseUserModuleProgressOptions) {
  const [rows, setRows] = useState<ModuleProgressRow[]>([])
  const [loading, setLoading] = useState(false)
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  const stableModuleIds = useMemo(() => Array.from(new Set(moduleIds.filter(Boolean))), [moduleIds])

  const load = useCallback(async () => {
    if (!userId || stableModuleIds.length === 0) {
      setRows([])
      return
    }

    setLoading(true)

    const { data, error } = await supabase
      .from('user_module_progress')
      .select('id, user_id, module_id, subject, completed, created_at, updated_at')
      .eq('user_id', userId)
      .in('module_id', stableModuleIds)

    if (error) {
      console.error('Failed to load user module progress:', error)
      setLoading(false)
      return
    }

    setRows((data || []) as ModuleProgressRow[])
    setLoading(false)
  }, [stableModuleIds, userId])

  useEffect(() => {
    void load()
  }, [load])

  const progressByModule = useMemo(() => {
    const map = new Map<string, ModuleProgressRow>()
    for (const row of rows) {
      map.set(row.module_id, row)
    }
    return map
  }, [rows])

  const completedCount = useMemo(() => rows.filter((row) => row.completed).length, [rows])

  const toggleModuleCompletion = useCallback(
    async (moduleId: string, options: ToggleOptions) => {
      if (!userId || !moduleId) return

      const existing = progressByModule.get(moduleId)
      const nextCompleted = !(existing?.completed ?? false)

      setTogglingIds((prev) => new Set(prev).add(moduleId))

      const payload = {
        user_id: userId,
        module_id: moduleId,
        subject: options.subject,
        completed: nextCompleted,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('user_module_progress')
        .upsert(payload, { onConflict: 'user_id,module_id' })
        .select('id, user_id, module_id, subject, completed, created_at, updated_at')
        .single()

      if (error) {
        console.error('Failed to toggle module progress:', error)
        setTogglingIds((prev) => {
          const next = new Set(prev)
          next.delete(moduleId)
          return next
        })
        return
      }

      setRows((prev) => {
        const withoutCurrent = prev.filter((row) => row.module_id !== moduleId)
        return [...withoutCurrent, data as ModuleProgressRow]
      })

      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(moduleId)
        return next
      })
    },
    [progressByModule, userId]
  )

  return {
    rows,
    loading,
    completedCount,
    progressByModule,
    togglingIds,
    toggleModuleCompletion,
    reloadProgress: load,
  }
}
