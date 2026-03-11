import type { SupabaseEvent } from './EventCard';

type Props = {
  internship: SupabaseEvent;
  onOpenDetails: (internship: SupabaseEvent) => void;
};

export default function InternshipCard({ internship, onOpenDetails }: Props) {
  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const internshipTitle = internship.role || internship.title || 'Internship Role';
  const organization = internship.organization || internship.company || 'Organization';
  const skills = internship.skills
    ? internship.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
    : [];

  return (
    <article
      onClick={() => onOpenDetails(internship)}
      className="glass rounded-xl p-6 min-h-[260px] flex flex-col justify-between border border-white/10 hover:border-white/20 hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="space-y-3">
        <h3 className="text-lg font-display font-semibold leading-snug">{organization}</h3>
        <p className="text-white/90 font-medium">{internshipTitle}</p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/90">
          <span className="rounded-full px-3 py-1 bg-white/10">🟢 {internship.mode || 'Mode NA'}</span>
          <span className="rounded-full px-3 py-1 bg-white/10">💰 {internship.stipend || 'Stipend NA'}</span>
          <span className="rounded-full px-3 py-1 bg-white/10">⏱ {internship.duration || 'Duration NA'}</span>
          <span className="rounded-full px-3 py-1 bg-white/10">📅 {deadline}</span>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full px-3 py-1 text-xs bg-white/10 text-secondary-text">
                {skill}
              </span>
            ))}
          </div>
        )}

        {skills.length === 0 && (
          <div className="text-sm text-secondary-text">No skills listed.</div>
        )}

        <div className="text-xs text-secondary-text">Tap card for details</div>
      </div>

      <div className="mt-4 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        {internship.registration_link ? (
          <a
            href={internship.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold"
          >
            Apply Now
          </a>
        ) : (
          <button disabled className="inline-flex items-center px-4 py-2 rounded-xl bg-white/6 text-secondary-text">
            Apply link unavailable
          </button>
        )}
      </div>
    </article>
  );
}
