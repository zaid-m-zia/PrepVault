'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '../../../lib/supabaseClient'
import FollowButton from '../../../components/profile/FollowButton'
import MessageButton from '../../../components/profile/MessageButton'
import EditProfileForm from '../../../components/profile/EditProfileForm'
import SuggestedEngineers from '../../../components/profile/SuggestedEngineers'
import ProfileHeader from '../../../components/profile/ProfileHeader'
import ProfileSkills from '../../../components/profile/ProfileSkills'
import ProfileProjects from '../../../components/profile/ProfileProjects'
import type { ProfileProject } from '../../../components/profile/projectTypes'
import ProfileActivity from '../../../components/profile/ProfileActivity'
import ProfileAchievements, { type ProfileAchievement } from '../../../components/profile/ProfileAchievements'
import ProfileLinks from '../../../components/profile/ProfileLinks'
import Button from '../../../components/ui/Button'
import FollowListModal from '../../../components/profile/FollowListModal'

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [followStatus, setFollowStatus] = useState<any>(null)
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [projects, setProjects] = useState<ProfileProject[]>([])
  const [projectSaving, setProjectSaving] = useState(false)
  const [projectToast, setProjectToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [achievements, setAchievements] = useState<ProfileAchievement[]>([])
  const [teamsCreated, setTeamsCreated] = useState(0)
  const [teamsJoined, setTeamsJoined] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [followListModal, setFollowListModal] = useState<{ type: 'followers' | 'following' } | null>(null)
  const router = useRouter()

  async function refetchProfile(profileId: string) {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error || !profileData) {
      return null
    }

    setProfile(profileData)
    return profileData
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        setUser(session?.user || null)

        const profileData = await refetchProfile(params.id)
        if (!profileData) {
          setLoading(false)
          return
        }

        if (session?.user) {
          const { data: followerRelation } = await supabase
            .from('followers')
            .select('id')
            .eq('follower_id', session.user.id)
            .eq('following_id', profileData.id)
            .maybeSingle()

          if (followerRelation) {
            setFollowStatus({ status: 'accepted' })
          } else {
            const { data: followRequest } = await supabase
              .from('follow_requests')
              .select('id, status, created_at')
              .eq('sender_id', session.user.id)
              .eq('receiver_id', profileData.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            setFollowStatus(followRequest || null)
          }
        }

        const [{ count: followers }, { count: following }, projectsRes, achievementsRes, { count: createdCount }, { count: joinedCount }] = await Promise.all([
          supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profileData.id),
          supabase
            .from('followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profileData.id),
          supabase
            .from('projects')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('achievements')
            .select('*')
            .eq('user_id', profileData.id)
            .order('year', { ascending: false }),
          supabase
            .from('teams')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', profileData.id),
          supabase
            .from('team_members')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', profileData.id),
        ])

        const normalizedProjects: ProfileProject[] = (projectsRes.data ?? []).map((project: any) => ({
          id: project.id,
          title: project.title || 'Untitled Project',
          description: project.description || '',
          tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
          github_link: project.github_link || '',
          demo_link: project.demo_link || '',
        }))

        const normalizedAchievements: ProfileAchievement[] = (achievementsRes.data ?? []).map((achievement: any) => ({
          id: achievement.id,
          title: achievement.title || 'Untitled Achievement',
          description: achievement.description || '',
          event: achievement.event || '',
          year: achievement.year || '',
        }))

        setFollowerCount(followers || 0)
        setFollowingCount(following || 0)
        setProjects(normalizedProjects)
        setAchievements(normalizedAchievements)
        setTeamsCreated(createdCount || 0)
        setTeamsJoined(joinedCount || 0)
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  useEffect(() => {
    const profileId = params.id

    async function refreshFollowerCounts() {
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileId),
        supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileId),
      ])
      setFollowerCount(followers || 0)
      setFollowingCount(following || 0)
    }

    const channel = supabase
      .channel(`followers-counts-${profileId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'followers', filter: `following_id=eq.${profileId}` },
        () => { void refreshFollowerCounts() }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'followers', filter: `following_id=eq.${profileId}` },
        () => { void refreshFollowerCounts() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  useEffect(() => {
    if (!projectToast) return
    const timeout = setTimeout(() => setProjectToast(null), 3000)
    return () => clearTimeout(timeout)
  }, [projectToast])

  if (loading) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10">
            <div className="animate-pulse">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/10 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-xl p-8 border border-white/10 text-center">
            <h1 className="text-2xl font-display font-bold mb-4">Profile Not Found</h1>
            <p className="text-secondary-text mb-6">The user you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/')} size="sm" className="px-6 py-2 rounded-md">
              Go Home
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const isOwnProfile = user?.id === profile.id

  const handleProfileUpdate = async () => {
    await refetchProfile(params.id)
    setEditing(false)
  }

  async function handleAddProject(payload: {
    title: string
    description: string
    tech_stack: string[]
    github_link: string
    demo_link: string
  }) {
    if (!user?.id || !isOwnProfile) return
    setProjectSaving(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: payload.title,
          description: payload.description,
          tech_stack: payload.tech_stack,
          github_link: payload.github_link,
          demo_link: payload.demo_link,
        })
        .select()
        .single()

      if (error) throw error

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      const normalizedProjects: ProfileProject[] = (projectsData ?? []).map((project: any) => ({
        id: project.id,
        title: project.title || 'Untitled Project',
        description: project.description || '',
        tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
        github_link: project.github_link || '',
        demo_link: project.demo_link || '',
      }))

      setProjects(normalizedProjects)
      setProjectToast({ type: 'success', message: 'Project added successfully.' })
    } catch (error) {
      console.error('Failed to add project:', error)
      setProjectToast({ type: 'error', message: 'Failed to add project. Please try again.' })
    } finally {
      setProjectSaving(false)
    }
  }

  async function handleEditProject(
    projectId: string,
    payload: {
      title: string
      description: string
      tech_stack: string[]
      github_link: string
      demo_link: string
    }
  ) {
    if (!user?.id || !isOwnProfile) return
    setProjectSaving(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          title: payload.title,
          description: payload.description,
          tech_stack: payload.tech_stack,
          github_link: payload.github_link,
          demo_link: payload.demo_link,
        })
        .eq('id', projectId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                id: data.id,
                title: data.title || 'Untitled Project',
                description: data.description || '',
                tech_stack: Array.isArray(data.tech_stack) ? data.tech_stack : [],
                github_link: data.github_link || '',
                demo_link: data.demo_link || '',
              }
            : project
        )
      )
      setProjectToast({ type: 'success', message: 'Project updated successfully.' })
    } catch (error) {
      console.error('Failed to update project:', error)
      setProjectToast({ type: 'error', message: 'Failed to update project. Please try again.' })
    } finally {
      setProjectSaving(false)
    }
  }

  async function handleDeleteProject(projectId: string) {
    if (!user?.id || !isOwnProfile) return
    setProjectSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

      if (error) throw error

      setProjects((prev) => prev.filter((project) => project.id !== projectId))
      setProjectToast({ type: 'success', message: 'Project deleted successfully.' })
    } catch (error) {
      console.error('Failed to delete project:', error)
      setProjectToast({ type: 'error', message: 'Failed to delete project. Please try again.' })
    } finally {
      setProjectSaving(false)
    }
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {projectToast && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              projectToast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {projectToast.message}
          </div>
        )}

        <ProfileHeader
          profile={profile}
          email={isOwnProfile ? user?.email : undefined}
          followerCount={followerCount}
          followingCount={followingCount}
          projectsCount={projects.length}
          teamsJoined={teamsJoined}
          teamsCreated={teamsCreated}
          onFollowersClick={() => setFollowListModal({ type: 'followers' })}
          onFollowingClick={() => setFollowListModal({ type: 'following' })}
          actions={
            <>
              {!isOwnProfile && user && (
                <div className="flex gap-3">
                  <FollowButton
                    profileId={profile.id}
                    currentStatus={followStatus?.status}
                    isFollowed={followStatus?.status === 'accepted'}
                    onStatusChange={async (newStatus) => {
                      setFollowStatus(newStatus ? { ...followStatus, status: newStatus } : null)

                      const { count: followers } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('following_id', profile.id)


                      const { count: following } = await supabase
                        .from('followers')
                        .select('*', { count: 'exact', head: true })
                        .eq('follower_id', profile.id)


                      setFollowerCount(followers || 0)
                      setFollowingCount(following || 0)
                    }}
                  />
                  <MessageButton profileId={profile.id} username={profile.username} />
                </div>
              )}

              {isOwnProfile && !editing && (
                <Button
                  onClick={() => setEditing(true)}
                  size="md"
                  className="px-6"
                >
                  Edit Profile
                </Button>
              )}

              {isOwnProfile && editing && (
                <EditProfileForm
                  profile={profile}
                  onSave={handleProfileUpdate}
                  onCancel={() => setEditing(false)}
                />
              )}
            </>
          }
        />

        <div className="space-y-4 mb-8">
          <ProfileSkills
            skills={Array.isArray(profile?.skills)
              ? profile.skills.filter((s: unknown) => typeof s === 'string' && (s as string).trim())
              : []}
          />
          <ProfileProjects
            projects={projects}
            isOwnProfile={isOwnProfile}
            saving={projectSaving}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
          <ProfileActivity teamsJoined={teamsJoined} teamsCreated={teamsCreated} />
          <ProfileAchievements achievements={achievements} />
          <ProfileLinks github={profile?.github} linkedin={profile?.linkedin} leetcode={profile?.leetcode} />
        </div>

        {!isOwnProfile && !followStatus && user?.user && (
          <div className="glass rounded-lg p-6 border border-white/10 bg-white/3">
            <p className="text-sm text-secondary-text">Follow to see more details and start messaging</p>
          </div>
        )}

        {isOwnProfile && <SuggestedEngineers />}
      </div>

      <FollowListModal
        isOpen={followListModal !== null}
        onClose={() => setFollowListModal(null)}
        profileId={profile.id}
        currentUserId={user?.id ?? null}
        type={followListModal?.type ?? 'followers'}
      />
    </section>
  )
}
