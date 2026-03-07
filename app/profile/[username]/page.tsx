import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import FollowButton from '../../../components/profile/FollowButton'
import MessageButton from '../../../components/profile/MessageButton'

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const cookieStore = cookies()
  const cookieMethods: any = {
    get: (name: string) => {
      const c = cookieStore.get(name)
      if (!c) return undefined
      return { name: c.name, value: c.value }
    },
    set: (cookie: any) => cookieStore.set(cookie),
    delete: (name: string) => cookieStore.delete(name),
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    { cookies: cookieMethods }
  )

  const { data: user } = await supabase.auth.getUser()

  // Fetch profile by username
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Check if current user is following this profile
  let followStatus = null
  if (user?.user) {
    const { data: follow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.user.id)
      .eq('following_id', profile.id)
      .maybeSingle()

    followStatus = follow
  }

  const isOwnProfile = user?.user?.id === profile.id

  return (
    <section className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="glass rounded-xl p-8 border border-white/10 mb-8">
          <div className="flex items-start gap-6 mb-6">
            <div className="flex items-start gap-6 flex-1">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-lg glass border border-white/10 flex items-center justify-center text-2xl font-bold">
                {profile.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || profile.username.charAt(0).toUpperCase()}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold">{profile.full_name || profile.username}</h1>
                <p className="text-lg text-secondary-text">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-3 text-secondary-text">{profile.bio}</p>
                )}
                {profile.created_at && (
                  <p className="mt-2 text-xs text-secondary-text">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                )}

                {/* Action Buttons */}
                {!isOwnProfile && user?.user && (
                  <div className="flex gap-3 mt-4">
                    <FollowButton
                      profileId={profile.id}
                      currentStatus={followStatus?.status}
                      isFollowed={followStatus?.status === 'accepted'}
                    />
                    <MessageButton profileId={profile.id} username={profile.username} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Show extended sections only if following or own profile */}
        {(isOwnProfile || followStatus?.status === 'accepted') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Skills</h3>
              <p className="mt-3 text-sm">Add skills to your profile</p>
            </div>

            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Teams</h3>
              <p className="mt-3 text-sm">No teams yet</p>
            </div>

            <div className="glass rounded-lg p-6 border border-white/10">
              <h3 className="text-sm font-semibold text-secondary-text">Resources</h3>
              <p className="mt-3 text-sm">Your shared resources</p>
            </div>
          </div>
        )}

        {/* Message info for non-followers */}
        {!isOwnProfile && !followStatus && user?.user && (
          <div className="glass rounded-lg p-6 border border-white/10 bg-white/3">
            <p className="text-sm text-secondary-text">
              Follow to see more details and start messaging
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
