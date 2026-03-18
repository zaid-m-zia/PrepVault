'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

type ProgressPoint = {
  date: string
  completed: number
}

type ProgressChartsProps = {
  completedModules: number
  remainingModules: number
  progressOverTime: ProgressPoint[]
}

const PIE_COLORS = ['#22c55e', '#64748b']

export default function ProgressCharts({ completedModules, remainingModules, progressOverTime }: ProgressChartsProps) {
  const pieData = [
    { name: 'Completed Modules', value: completedModules },
    { name: 'Remaining Modules', value: remainingModules },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Completed vs Remaining</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Progress Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
