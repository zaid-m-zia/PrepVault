import Button from '../ui/Button';
import Avatar from '../ui/Avatar';

export type HackHubUser = {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string | null;
  college: string;
  branch: string;
  bio: string;
  skills: string[];
  lookingFor: string[];
  github: string;
  linkedin: string;
  leetcode: string;
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
          <div className="mb-3">
            <Avatar
              user={{
                full_name: user.name,
                username: user.username,
                avatar_url: user.avatar_url,
              }}
              size="medium"
            />
          </div>
          <h3 className="text-lg font-display font-semibold">{user.name}</h3>
          {(user.college || user.branch) && (
            <p className="mt-1 text-xs text-secondary-text">
              {[user.college, user.branch].filter(Boolean).join(' · ')}
            </p>
          )}
          <p className="mt-2 text-sm text-secondary-text line-clamp-3">{user.bio}</p>

          {user.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span key={s} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{s}</span>
              ))}
            </div>
          )}

          {user.lookingFor.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-secondary-text mb-2">Looking for:</div>
              <div className="flex flex-wrap gap-2">
                {user.lookingFor.map((item) => (
                  <span key={item} className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text">{item}</span>
                ))}
              </div>
            </div>
          )}

          {(user.github || user.linkedin || user.leetcode) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.github && (
                <a href={user.github} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-3 py-1 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                  GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-3 py-1 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                  LinkedIn
                </a>
              )}
              {user.leetcode && (
                <a href={user.leetcode} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-3 py-1 rounded-full bg-white/3 text-secondary-text hover:text-white hover:bg-white/10 transition">
                  LeetCode
                </a>
              )}
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
