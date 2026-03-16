'use client'

import { useEffect, useMemo, useState } from 'react'

type AvatarUser = {
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
}

type AvatarProps = {
  user: AvatarUser
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeClassMap: Record<NonNullable<AvatarProps['size']>, string> = {
  small: 'h-8 w-8 text-xs',
  medium: 'h-10 w-10 text-sm',
  large: 'h-24 w-24 text-2xl',
}

function getInitials(user: AvatarUser) {
  const source = (user.full_name || user.username || 'U').trim()
  const parts = source.split(' ').filter(Boolean)
  if (parts.length === 0) return 'U'

  const initials = parts
    .slice(0, 3)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'U'
}

export default function Avatar({ user, size = 'medium', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [user.avatar_url])

  const initials = useMemo(() => getInitials(user), [user])

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white font-bold text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none ${sizeClassMap[size]} ${className}`}
    >
      {user.avatar_url && !imageError ? (
        <img
          src={user.avatar_url}
          alt={user.full_name || user.username || 'User'}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        initials
      )}
    </div>
  )
}
