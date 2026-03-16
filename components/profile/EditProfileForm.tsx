'use client'

import { useEffect, useState } from 'react'
import supabase from '../../lib/supabaseClient'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import Avatar from '../ui/Avatar'

type EditProfileFormProps = {
  profile: any
  onSave: (updatedProfile: any) => void
  onCancel: () => void
}

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-400'

export default function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const initialSkills = Array.isArray(profile?.skills)
    ? profile.skills.filter((s: unknown) => typeof s === 'string' && (s as string).trim())
    : []

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    college: profile?.college || '',
    branch: profile?.branch || '',
    github: profile?.github || '',
    linkedin: profile?.linkedin || '',
    leetcode: profile?.leetcode || '',
    skills: initialSkills as string[],
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(profile?.avatar_url || null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    setAvatarPreviewUrl(profile?.avatar_url || null)
  }, [profile?.avatar_url])

  function field(key: keyof typeof formData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function addSkill(value: string) {
    const normalized = value.trim()
    if (!normalized) return
    setFormData((prev) => {
      if (prev.skills.some((s) => s.toLowerCase() === normalized.toLowerCase())) return prev
      return { ...prev, skills: [...prev.skills, normalized] }
    })
  }

  function removeSkill(skillToRemove: string) {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skillToRemove) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) throw new Error('Not authenticated')

      let avatarUrl = profile?.avatar_url || null

      if (selectedAvatarFile) {
        setAvatarUploading(true)

        const extension = selectedAvatarFile.name.split('.').pop()?.toLowerCase() || 'png'
        const filePath = `${session.user.id}-avatar.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, selectedAvatarFile, { upsert: true, contentType: selectedAvatarFile.type })

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('profile-images')
          .getPublicUrl(filePath)

        avatarUrl = publicUrlData?.publicUrl ? `${publicUrlData.publicUrl}?t=${Date.now()}` : null
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          college: formData.college,
          branch: formData.branch,
          avatar_url: avatarUrl,
          github: formData.github,
          linkedin: formData.linkedin,
          leetcode: formData.leetcode,
          skills: formData.skills,
        })
        .eq('id', session.user.id)
        .select()
        .single()

      if (updateError) throw updateError

      onSave(updatedData)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setAvatarUploading(false)
      setLoading(false)
    }
  }

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid image format. Please upload PNG, JPG, JPEG, or WEBP.')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image size must be 5MB or less.')
      return
    }

    setError(null)
    setSelectedAvatarFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreviewUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-8 border border-white/10 mb-8"
    >
      <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + Username */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input type="text" value={formData.full_name} onChange={field('full_name')} className={inputCls} placeholder="Enter your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input type="text" value={formData.username} onChange={field('username')} className={inputCls} placeholder="Enter your username" />
          </div>
        </div>

        {/* College + Branch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">College</label>
            <input type="text" value={formData.college} onChange={field('college')} className={inputCls} placeholder="e.g. MIT" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Branch</label>
            <input type="text" value={formData.branch} onChange={field('branch')} className={inputCls} placeholder="e.g. Computer Science" />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            value={formData.bio}
            onChange={field('bio')}
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Profile Avatar</label>
          <div className="flex items-center gap-4">
            <Avatar
              user={{
                full_name: formData.full_name,
                username: formData.username,
                avatar_url: avatarPreviewUrl,
              }}
              size="large"
            />
            <div className="flex-1">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                onChange={handleAvatarFileChange}
                className={inputCls}
              />
              <p className="mt-2 text-xs text-secondary-text">PNG, JPG, JPEG, WEBP • Max 5MB</p>
            </div>
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="text-sm font-medium mb-3">Links</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-secondary-text mb-1">GitHub URL</label>
              <input type="url" value={formData.github} onChange={field('github')} className={inputCls} placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="block text-xs text-secondary-text mb-1">LinkedIn URL</label>
              <input type="url" value={formData.linkedin} onChange={field('linkedin')} className={inputCls} placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="block text-xs text-secondary-text mb-1">LeetCode URL</label>
              <input type="url" value={formData.leetcode} onChange={field('leetcode')} className={inputCls} placeholder="https://leetcode.com/username" />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2">Skills <span className="text-secondary-text font-normal">(press Enter to add)</span></label>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill(skillInput)
                setSkillInput('')
              }
            }}
            className={inputCls}
            placeholder="Add a skill and press Enter"
          />
          {formData.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text hover:bg-red-500/10 hover:text-red-400 transition"
                >
                  {skill} ×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading} className="px-6 py-3 rounded-lg">
            {loading || avatarUploading ? 'Saving...' : 'Save Changes'}
          </Button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-white border border-gray-300 text-slate-900 hover:bg-gray-100 rounded-lg transition dark:bg-transparent dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}