import type { ReactNode } from 'react'
import Avatar from '../ui/Avatar'

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
  return (
    <div className="glass rounded-xl p-8 border border-white/10 mb-8">
      <div className="flex items-start gap-6">
        <Avatar
          user={{
            full_name: profile?.full_name,
            username: profile?.username,
            avatar_url: profile?.avatar_url,
          }}
          size="large"
          className="flex-shrink-0"
        />

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
