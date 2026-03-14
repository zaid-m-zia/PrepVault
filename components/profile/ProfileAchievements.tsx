export type ProfileAchievement = {
  id: string
  title: string
  description: string
  event: string
  year: number | string
}

type ProfileAchievementsProps = {
  achievements: ProfileAchievement[]
}

export default function ProfileAchievements({ achievements }: ProfileAchievementsProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h2 className="text-sm font-semibold text-secondary-text mb-3">Achievements</h2>
      {achievements.length === 0 ? (
        <p className="text-sm text-secondary-text">No achievements added yet.</p>
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <article key={achievement.id} className="rounded-lg border border-white/10 bg-white/3 p-4">
              <h3 className="text-base font-semibold">{achievement.title}</h3>
              {(achievement.event || achievement.year) && (
                <p className="text-xs text-secondary-text mt-1">{[achievement.event, achievement.year].filter(Boolean).join(' • ')}</p>
              )}
              {achievement.description && (
                <p className="mt-2 text-sm text-secondary-text" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {achievement.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
