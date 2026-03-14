import { useState } from 'react';
import Button from '../ui/Button';

export type HackHubTeam = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  lookingFor: string[];
  createdByName: string;
  joined?: boolean;
};

export default function TeamCard({
  team,
  onJoin,
  joining = false,
}: {
  team: HackHubTeam;
  onJoin?: (teamId: string) => void;
  joining?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={`glass rounded-xl p-5 border transition-all duration-300 transform cursor-pointer ${
        expanded
          ? 'border-white/20 shadow-lg -translate-y-0.5 scale-[1.01]'
          : 'border-white/10 hover:border-white/20'
      }`}
      onClick={() => setExpanded((prev) => !prev)}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold">{team.name}</h3>
          <p className={`mt-2 text-sm text-secondary-text transition-all duration-300 ${expanded ? 'line-clamp-none' : 'line-clamp-3'}`}>
            {team.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {team.techStack.map((s) => (
              <span key={s} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{s}</span>
            ))}
          </div>

          {team.lookingFor.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-secondary-text mb-2">Looking for:</div>
              <div className="flex flex-wrap gap-2">
                {team.lookingFor.map((role) => (
                  <span key={role} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{role}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-secondary-text">
            Created by <span className="text-slate-900 dark:text-white font-medium">{team.createdByName}</span>
          </div>
          <Button
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onJoin?.(team.id);
            }}
            disabled={joining || team.joined}
          >
            {team.joined ? 'Joined' : joining ? 'Joining...' : 'Join Team'}
          </Button>
        </div>
      </div>
    </article>
  );
}
