'use client'

import { useEffect, useMemo, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import ProgressCharts from '../../components/dashboard/ProgressCharts'
import SubjectsProgressSection from '../../components/dashboard/SubjectsProgressSection'
import TeamsSection from '../../components/dashboard/TeamsSection'
import WeeklyProgressSection from '../../components/dashboard/WeeklyProgressSection'
import { useUserModuleProgress } from '../../lib/hooks/useUserModuleProgress'

type SubjectRow = {
  id: string
  name: string
}

type ModuleRow = {
  id: string
  subject_id: string
  module_name: string
}

type TeamRow = {
  id: string
  name: string
  created_by: string
}

type TeamMemberRow = {
  team_id: string
  user_id: string
}

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)
  const [subjects, setSubjects] = useState<SubjectRow[]>([])
  const [modules, setModules] = useState<ModuleRow[]>([])
  const [teams, setTeams] = useState<TeamRow[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([])
  const [loading, setLoading] = useState(true)

  const moduleIds = useMemo(() => modules.map((module) => module.id), [modules])

  const {
    rows: progressRows,
    completedCount,
  } = useUserModuleProgress({
    userId: currentUser?.id ?? null,
    moduleIds,
  })

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUser = sessionData?.session?.user

      if (!sessionUser) {
        setCurrentUser(null)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', sessionUser.id)
        .maybeSingle()

      setCurrentUser({
        id: sessionUser.id,
        name: profile?.full_name || profile?.username || 'Student',
      })

      const [{ data: subjectsData }, { data: modulesData }] = await Promise.all([
        supabase
          .from('subjects')
          .select('id, name')
          .order('name', { ascending: true }),
        supabase
          .from('modules')
          .select('id, subject_id, module_name')
          .order('module_name', { ascending: true }),
      ])

      const resolvedSubjects = (subjectsData || []) as SubjectRow[]
      const resolvedModules = (modulesData || []) as ModuleRow[]

      setSubjects(resolvedSubjects)
      setModules(resolvedModules)

      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id, user_id')
        .eq('user_id', sessionUser.id)

      const membershipTeamIds = Array.from(new Set((memberships || []).map((membership: any) => membership.team_id)))

      const { data: ownedTeams } = await supabase
        .from('teams')
        .select('id, name, created_by')
        .eq('created_by', sessionUser.id)

      const ownedIds = new Set((ownedTeams || []).map((team: any) => team.id))
      const teamsToFetch = Array.from(new Set([...membershipTeamIds, ...Array.from(ownedIds)]))

      if (teamsToFetch.length > 0) {
        const [{ data: teamRows }, { data: teamMemberRows }] = await Promise.all([
          supabase
            .from('teams')
            .select('id, name, created_by')
            .in('id', teamsToFetch),
          supabase
            .from('team_members')
            .select('team_id, user_id')
            .in('team_id', teamsToFetch),
        ])

        setTeams((teamRows || []) as TeamRow[])
        setTeamMembers((teamMemberRows || []) as TeamMemberRow[])
      } else {
        setTeams([])
        setTeamMembers([])
      }

      setLoading(false)
    }

    void loadDashboard()
  }, [])

  const completedModuleIds = useMemo(
    () => new Set(progressRows.filter((row) => row.completed).map((row) => row.module_id)),
    [progressRows]
  )

  const remainingModules = Math.max(0, modules.length - completedCount)

  const progressOverTime = useMemo(() => {
    const countsByDate = new Map<string, number>()

    for (const row of progressRows) {
      if (!row.completed) continue
      const rawDate = row.updated_at || row.created_at
      if (!rawDate) continue

      const date = new Date(rawDate).toISOString().slice(0, 10)
      countsByDate.set(date, (countsByDate.get(date) || 0) + 1)
    }

    return Array.from(countsByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, completed]) => ({ date, completed }))
  }, [progressRows])

  const subjectsProgress = useMemo(() => {
    return subjects
      .map((subject) => {
        const subjectModules = modules.filter((module) => module.subject_id === subject.id)
        const totalModules = subjectModules.length
        const completedModules = subjectModules.filter((module) => completedModuleIds.has(module.id)).length
        const percentCompleted = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100)

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          completedModules,
          totalModules,
          percentCompleted,
        }
      })
      .filter((subject) => subject.totalModules > 0)
  }, [subjects, modules, completedModuleIds])

  const teamsSummary = useMemo(() => {
    if (!currentUser) return []

    const memberCounts = new Map<string, number>()
    for (const teamMember of teamMembers) {
      memberCounts.set(teamMember.team_id, (memberCounts.get(teamMember.team_id) || 0) + 1)
    }

    return teams.map((team) => ({
      teamId: team.id,
      teamName: team.name,
      membersCount: memberCounts.get(team.id) || 0,
      role: team.created_by === currentUser.id ? 'Owner' as const : 'Member' as const,
    }))
  }, [currentUser, teamMembers, teams])

  const completedThisWeek = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return progressRows.filter((row) => {
      if (!row.completed) return false
      const rawDate = row.updated_at || row.created_at
      if (!rawDate) return false
      return new Date(rawDate) >= weekAgo
    }).length
  }, [progressRows])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 dark:text-white">
            Welcome back, {currentUser?.name || 'Student'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track your learning progress</p>
        </div>

        <ProgressCharts
          completedModules={completedCount}
          remainingModules={remainingModules}
          progressOverTime={progressOverTime}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubjectsProgressSection subjects={subjectsProgress} />
          <TeamsSection teams={teamsSummary} />
        </div>

        <WeeklyProgressSection completedThisWeek={completedThisWeek} />
      </div>
    </section>
  )
}
