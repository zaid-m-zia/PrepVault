type ProfileLinksProps = {
  github?: string
  linkedin?: string
  leetcode?: string
}

export default function ProfileLinks({ github, linkedin, leetcode }: ProfileLinksProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h2 className="text-sm font-semibold text-secondary-text mb-3">Social Links</h2>
      {!github && !linkedin && !leetcode ? (
        <p className="text-sm text-secondary-text">No social links added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition"
            >
              GitHub
            </a>
          )}
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition"
            >
              LinkedIn
            </a>
          )}
          {leetcode && (
            <a
              href={leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition"
            >
              LeetCode
            </a>
          )}
        </div>
      )}
    </div>
  )
}
