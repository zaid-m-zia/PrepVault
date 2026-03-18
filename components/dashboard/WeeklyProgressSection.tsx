type WeeklyProgressSectionProps = {
  completedThisWeek: number
}

export default function WeeklyProgressSection({ completedThisWeek }: WeeklyProgressSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Weekly Progress</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        You completed <span className="font-semibold text-blue-600 dark:text-blue-400">{completedThisWeek}</span> modules this week
      </p>
      <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">Keep Going 🚀</p>
    </div>
  )
}
