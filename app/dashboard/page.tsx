export default function DashboardPage() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your activity, skills, and insights in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Skills</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              See your core skills at a glance and keep your profile strengths up to date.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recommended Skills (AI)</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Get machine-learning suggestions based on your profile and developer data patterns.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Your Activity</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track your latest actions, engagement, and progress from one central dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
