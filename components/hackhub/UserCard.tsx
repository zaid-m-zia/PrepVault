import Button from '../ui/Button';

export type HackHubUser = {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  lookingFor: string[];
};

export default function UserCard({
  user,
  onConnect,
}: {
  user: HackHubUser;
  onConnect?: (userId: string) => void;
}) {
  return (
    <article className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 hover:shadow-lg transition-transform transform hover:-translate-y-0.5">
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold">{user.name}</h3>
          <p className="mt-2 text-sm text-secondary-text line-clamp-3">{user.bio}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span key={s} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{s}</span>
            ))}
          </div>

          {user.lookingFor.length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-secondary-text mb-2">Looking for:</div>
              <div className="flex flex-wrap gap-2">
                {user.lookingFor.map((item) => (
                  <span key={item} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button size="sm" onClick={() => onConnect?.(user.id)}>Connect</Button>
        </div>
      </div>
    </article>
  );
}
