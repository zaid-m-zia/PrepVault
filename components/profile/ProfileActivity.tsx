type ProfileActivityProps = {
  teamsJoined: number
  teamsCreated: number
}

export default function ProfileActivity({ teamsJoined, teamsCreated }: ProfileActivityProps) {
  return (
    <div className="glass rounded-xl p-6 border border-white/10">
      <h2 className="text-sm font-semibold text-secondary-text mb-3">HackHub Activity</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/3 p-4">
          <p className="text-xs text-secondary-text">Teams Created</p>
          <p className="mt-1 text-lg font-semibold">{teamsCreated}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/3 p-4">
          <p className="text-xs text-secondary-text">Teams Joined</p>
          <p className="mt-1 text-lg font-semibold">{teamsJoined}</p>
        </div>
      </div>
    </div>
  )
}
