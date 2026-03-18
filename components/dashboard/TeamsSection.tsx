type TeamSummary = {
  teamId: string
  teamName: string
  membersCount: number
  role: 'Owner' | 'Member'
}

type TeamsSectionProps = {
  teams: TeamSummary[]
}

export default function TeamsSection({ teams }: TeamsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">My Teams</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Your HackHub collaborations</p>

      {teams.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">You haven&apos;t joined or created any teams yet.</p>
      ) : (
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.teamId} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{team.teamName}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {team.role}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">Members: {team.membersCount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
