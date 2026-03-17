import { CheckCircle2, Sparkles } from 'lucide-react'

type SmartSkillInsightsProps = {
  userSkills: string[]
  suggestedSkills: string[]
}

type BadgeVariant = 'high-demand' | 'trending' | 'recommended'

function toTitleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ')
}

function getBadgeVariant(index: number): BadgeVariant {
  const sequence: BadgeVariant[] = ['high-demand', 'trending', 'recommended']
  return sequence[index % sequence.length]
}

function getBadgeMeta(variant: BadgeVariant) {
  if (variant === 'high-demand') {
    return {
      label: '🔥 High Demand',
      className: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-400/30',
    }
  }

  if (variant === 'trending') {
    return {
      label: '🚀 Trending',
      className: 'bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border border-fuchsia-400/30',
    }
  }

  return {
    label: '💡 Recommended',
    className: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/30',
  }
}

export default function SmartSkillInsights({ userSkills, suggestedSkills }: SmartSkillInsightsProps) {
  const normalizedUserSkills = Array.from(new Set(userSkills.filter(Boolean)))

  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl" />

      <div className="relative rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-sm p-6 md:p-7">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-secondary-text">Your Skills</h2>

          {normalizedUserSkills.length === 0 ? (
            <p className="text-sm text-secondary-text">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {normalizedUserSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 hover:scale-105"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {toTitleCase(skill)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-6">
          <h3 className="text-sm font-semibold text-secondary-text mb-3">Smart Skill Insights</h3>

          {suggestedSkills.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-secondary-text">
              Add more skills to unlock AI-powered recommendations ✨
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {suggestedSkills.map((skill, index) => {
                const badge = getBadgeMeta(getBadgeVariant(index))

                return (
                  <div
                    key={skill}
                    className="rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white leading-tight">{toTitleCase(skill)}</p>
                      <Sparkles className="h-4 w-4 text-indigo-300 flex-shrink-0" />
                    </div>

                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-slate-400">
            These recommendations are powered by Machine Learning using real developer data patterns.
          </p>
        </div>
      </div>
    </div>
  )
}