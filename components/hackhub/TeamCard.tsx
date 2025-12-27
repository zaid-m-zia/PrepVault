import type { Team } from '../../data/mock/teams';
import Link from 'next/link';

export default function TeamCard({ team }: { team: Team }) {
  return (
    <article className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 hover:shadow-lg transition-transform transform hover:-translate-y-0.5">
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold">{team.name}</h3>
          <p className="mt-2 text-sm text-secondary-text line-clamp-3">{team.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {team.skillsRequired.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/3 text-secondary-text">{s}</span>
            ))}
          </div>

          {team.lookingFor && (
            <div className="mt-3 text-sm text-secondary-text">Looking for: <span className="text-white font-medium">{team.lookingFor.join(', ')}</span></div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-secondary-text">Created by <span className="text-white font-medium">{team.createdBy}</span></div>
          <button className="inline-flex items-center px-3 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">Join Team</button>
        </div>
      </div>
    </article>
  );
}
