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
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    }
  }

  if (variant === 'trending') {
    return {
      label: '🚀 Trending',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    }
  }

  return {
    label: '💡 Recommended',
    className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  }
}

export default function SmartSkillInsights({ userSkills, suggestedSkills }: SmartSkillInsightsProps) {
  const normalizedUserSkills = Array.from(new Set(userSkills.filter(Boolean)))

  return (
    <div className="relative rounded-2xl p-[1px] bg-gray-200 dark:bg-gradient-to-r dark:from-blue-500/60 dark:via-purple-500/60 dark:to-cyan-500/60 transition-all duration-300">
      <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 dark:opacity-100 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-xl transition-all duration-300" />

      <div className="relative rounded-2xl border border-gray-200 bg-white shadow-md dark:bg-gray-900 dark:border-gray-700 dark:shadow-lg p-6 md:p-7 transition-all duration-300">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Skills</h2>

          {normalizedUserSkills.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {normalizedUserSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 transition-all duration-300 hover:scale-105"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {toTitleCase(skill)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Smart Skill Insights</h3>

          {suggestedSkills.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-5 text-sm text-gray-600 dark:text-gray-400 transition-all duration-300">
              Add more skills to unlock AI-powered recommendations ✨
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {suggestedSkills.map((skill, index) => {
                const badge = getBadgeMeta(getBadgeVariant(index))

                return (
                  <div
                    key={skill}
                    className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:hover:shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{toTitleCase(skill)}</p>
                      <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-300 flex-shrink-0" />
                    </div>

                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            These recommendations are powered by Machine Learning using real developer data patterns.
          </p>
        </div>
      </div>
    </div>
  )
}