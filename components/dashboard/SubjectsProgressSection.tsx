import { useRouter } from 'next/navigation'

type SubjectProgress = {
  subjectId: string
  subjectName: string
  completedModules: number
  totalModules: number
  percentCompleted: number
  nextModuleId: string | null
}

type SubjectsProgressSectionProps = {
  subjects: SubjectProgress[]
}

export default function SubjectsProgressSection({ subjects }: SubjectsProgressSectionProps) {
  const router = useRouter()

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Subjects</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Continue Learning • Pick up where you left off</p>
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No started subjects yet. Complete a module to begin.</p>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.subjectId}
              onClick={() => {
                if (!subject.nextModuleId) return
                router.push(`/resources?subject=${subject.subjectId}&module=${subject.nextModuleId}`)
              }}
              className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 transition-all duration-300 ${
                subject.nextModuleId
                  ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md'
                  : 'cursor-default opacity-95'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{subject.subjectName}</p>
                <span className="text-xs text-gray-600 dark:text-gray-400">{subject.percentCompleted}%</span>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${subject.percentCompleted}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {subject.completedModules}/{subject.totalModules} modules completed
                </span>
                {subject.percentCompleted === 100 ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">Completed ✔</span>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-medium">Continue Learning</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
