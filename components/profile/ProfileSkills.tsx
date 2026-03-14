type ProfileSkillsProps = {
  skills: string[]
}

export default function ProfileSkills({ skills }: ProfileSkillsProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h2 className="text-sm font-semibold text-secondary-text mb-3">Skills</h2>
      {skills.length === 0 ? (
        <p className="text-sm text-secondary-text">No skills added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
