import type { User } from '../../data/mock/users';
import Button from '../ui/Button';

export default function UserCard({ user }: { user: User }) {
  return (
    <article className="glass rounded-xl p-5 border border-white/10 hover:border-white/20 hover:shadow-lg transition-transform transform hover:-translate-y-0.5">
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="text-lg font-display font-semibold">{user.name}</h3>
          <p className="mt-2 text-sm text-secondary-text line-clamp-3">{user.bio}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {user.skills.map((s) => (
              <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/3 text-secondary-text">{s}</span>
            ))}
          </div>

          <div className="mt-3 text-sm text-secondary-text">Looking for: <span className="text-slate-900 dark:text-white font-medium">{user.lookingFor}</span></div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button size="sm">Connect</Button>
        </div>
      </div>
    </article>
  );
}
