'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabaseClient'
import Button from '../../../components/ui/Button'
import TeamChat from '../../../components/hackhub/TeamChat'

type TeamDetails = {
  id: string
  name: string
  description: string
  tech_stack: string[]
  looking_for: string[]
  created_by: string
  created_at?: string
}

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [creatorName, setCreatorName] = useState('Unknown')
  const [creatorId, setCreatorId] = useState<string | null>(null)
  const [memberCount, setMemberCount] = useState(0)

  useEffect(() => {
    async function loadTeam() {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', params.id)
          .single()

        if (teamError || !teamData) {
          setTeam(null)
          return
        }

        const normalized: TeamDetails = {
          id: teamData.id,
          name: teamData.name || 'Untitled Team',
          description: teamData.description || 'No description provided.',
          tech_stack: Array.isArray(teamData.tech_stack) ? teamData.tech_stack : [],
          looking_for: Array.isArray(teamData.looking_for) ? teamData.looking_for : [],
          created_by: teamData.created_by || '',
          created_at: teamData.created_at,
        }

        setTeam(normalized)
        setCreatorId(normalized.created_by)

        const [{ data: creatorData }, { count }] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, username')
            .eq('id', normalized.created_by)
            .maybeSingle(),
          supabase
            .from('team_members')
            .select('id', { count: 'exact', head: true })
            .eq('team_id', normalized.id),
        ])

        setCreatorName(creatorData?.full_name || creatorData?.username || 'Unknown')
        setMemberCount(count || 0)
      } catch (error) {
        console.error('Failed to load team details:', error)
        setTeam(null)
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [params.id])

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="glass rounded-xl p-6 border border-white/10 text-sm text-secondary-text">Loading team...</div>
        </div>
      </section>
    )
  }

  if (!team) {
    return (
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="glass rounded-xl p-6 border border-white/10">
            <h1 className="text-2xl font-display font-semibold">Team Not Found</h1>
            <p className="mt-2 text-sm text-secondary-text">This team does not exist or was removed.</p>
            <div className="mt-4">
              <Button size="sm" onClick={() => router.push('/hackhub')}>Back to HackHub</Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="glass rounded-xl p-6 border border-white/10">
          <h1 className="text-2xl font-display font-bold">{team.name}</h1>
          <p className="mt-3 text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{team.description}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-md bg-white/3 p-3">
              <p className="text-xs text-secondary-text">Creator</p>
              {creatorId ? (
                <Link href={`/profile/${creatorId}`} className="mt-1 block font-medium text-slate-900 dark:text-white hover:underline">
                  {creatorName}
                </Link>
              ) : (
                <p className="mt-1 font-medium text-slate-900 dark:text-white">{creatorName}</p>
              )}
            </div>
            <div className="rounded-md bg-white/3 p-3">
              <p className="text-xs text-secondary-text">Members Joined</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{memberCount}</p>
            </div>
            <div className="rounded-md bg-white/3 p-3">
              <p className="text-xs text-secondary-text">Members Needed</p>
              <p className="mt-1 font-medium text-slate-900 dark:text-white">{team.looking_for.length}</p>
            </div>
          </div>

          {team.tech_stack.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-secondary-text mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {team.tech_stack.map((tech) => (
                  <span key={tech} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{tech}</span>
                ))}
              </div>
            </div>
          )}

          {team.looking_for.length > 0 && (
            <div className="mt-5">
              <p className="text-sm text-secondary-text mb-2">Looking For</p>
              <div className="flex flex-wrap gap-2">
                {team.looking_for.map((item) => (
                  <span key={item} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{item}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button size="sm" variant="secondary" onClick={() => router.push('/hackhub')}>Back to HackHub</Button>
          </div>
        </div>

        <TeamChat teamId={team.id} />
      </div>
    </section>
  )
}
