import Button from '../ui/Button';

export type HackHubTeam = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  lookingFor: string[];
  createdById: string;
  createdByName: string;
  joined?: boolean;
};

export default function TeamCard({
  team,
  onOpen,
  onJoin,
  onEdit,
  onDelete,
  joining = false,
}: {
  team: HackHubTeam;
  onOpen?: (teamId: string) => void;
  onJoin?: (teamId: string) => void;
  onEdit?: (teamId: string) => void;
  onDelete?: (teamId: string) => void;
  joining?: boolean;
}) {
  return (
    <article
      className="glass rounded-xl p-5 border transition-all duration-300 transform cursor-pointer border-white/10 hover:border-white/20"
      onClick={() => onOpen?.(team.id)}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold">{team.name}</h3>
          <p className="mt-2 text-sm text-secondary-text line-clamp-3">{team.description}</p>

          <p className="mt-2 text-xs text-secondary-text">
            Members needed: <span className="text-slate-900 dark:text-white font-medium">{team.lookingFor.length}</span>
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
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(team.id);
                }}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="danger"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(team.id);
                }}
              >
                Delete
              </Button>
            )}
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
      </div>
    </article>
  );
}
