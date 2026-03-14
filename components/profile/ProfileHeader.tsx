import { useEffect, useState, type ReactNode } from 'react'

type ProfileHeaderProps = {
  profile: any
  email?: string
  followerCount: number
  followingCount: number
  projectsCount: number
  teamsJoined: number
  teamsCreated: number
  actions?: ReactNode
}

export default function ProfileHeader({
  profile,
  email,
  followerCount,
  followingCount,
  projectsCount,
  teamsJoined,
  teamsCreated,
  actions,
}: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [profile?.avatar_url])

  const initials = (profile?.full_name || profile?.username || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="glass rounded-xl p-8 border border-white/10 mb-8">
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-lg glass border border-white/10 flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
          {profile?.avatar_url && !imageError ? (
            <img
              src={profile.avatar_url}
              alt={profile?.full_name || profile?.username || 'User'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-display font-bold">{profile?.full_name || profile?.username}</h1>
          {profile?.username && <p className="text-lg text-secondary-text">@{profile.username}</p>}

          {profile?.bio && (
            <p className="mt-3 text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
              {profile.bio}
            </p>
          )}

          {(profile?.college || profile?.branch) && (
            <p className="mt-2 text-sm text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
              {[profile?.college, profile?.branch].filter(Boolean).join(' • ')}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{followerCount}</span>
              <span className="text-secondary-text ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">{followingCount}</span>
              <span className="text-secondary-text ml-1">Following</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-white/3 rounded-md">
              <p className="text-xs text-secondary-text">Projects</p>
              <p className="mt-1 text-sm font-medium">{projectsCount}</p>
            </div>
            <div className="p-3 bg-white/3 rounded-md">
              <p className="text-xs text-secondary-text">Teams Joined</p>
              <p className="mt-1 text-sm font-medium">{teamsJoined}</p>
            </div>
            <div className="p-3 bg-white/3 rounded-md">
              <p className="text-xs text-secondary-text">Teams Created</p>
              <p className="mt-1 text-sm font-medium">{teamsCreated}</p>
            </div>
            <div className="p-3 bg-white/3 rounded-md">
              <p className="text-xs text-secondary-text">Email</p>
              <p className="mt-1 text-sm font-medium break-all">{email || profile?.email || 'Private'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div className="p-3 bg-white/3 rounded-md">
              <p className="text-xs text-secondary-text">Phone</p>
              <p className="mt-1 text-sm font-medium">{profile?.phone || '—'}</p>
            </div>
            {profile?.created_at && (
              <div className="p-3 bg-white/3 rounded-md">
                <p className="text-xs text-secondary-text">Joined</p>
                <p className="mt-1 text-sm font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {actions && <div className="mt-4">{actions}</div>}
        </div>
      </div>
    </div>
  )
}
