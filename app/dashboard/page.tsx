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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track your recent actions across resources, chat, and profile updates.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Skills Snapshot</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View your current skills and keep your profile up to date.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm md:col-span-2 xl:col-span-1">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Discover recommendations and opportunities tailored to your profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
