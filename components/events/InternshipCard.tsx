'use client'

import type { SupabaseEvent } from './EventCard';
import { getDeadlineText, getDaysRemaining, getUrgencyLevel, getUrgencyBadgeClass, isNewOpportunity } from '../../lib/opportunityUtils';
import { buttonClasses } from '../ui/Button';

type Props = {
  internship: SupabaseEvent;
  onOpenDetails: (internship: SupabaseEvent) => void;
  isCompact?: boolean;
};

export default function InternshipCard({ internship, onOpenDetails, isCompact = false }: Props) {
  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const internshipTitle = internship.role || internship.title || 'Internship Role';
  const organization = internship.organization || internship.company || 'Organization';
  const skills = internship.skills
    ? internship.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
    : [];

  const daysRemaining = getDaysRemaining(internship.deadline);
  const urgencyLevel = getUrgencyLevel(daysRemaining);
  const urgencyBadgeClass = getUrgencyBadgeClass(urgencyLevel);
  const deadlineText = getDeadlineText(internship.deadline);
  const isNew = isNewOpportunity(internship.created_at);

  const minHeightClass = isCompact ? 'min-h-[240px]' : 'min-h-[260px]';

  return (
    <article
      onClick={() => onOpenDetails(internship)}
      className={`relative transform-gpu origin-center will-change-transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl glass rounded-xl p-6 ${minHeightClass} w-full max-w-xl flex flex-col justify-between border border-white/20 hover:border-white/30 cursor-pointer`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-display font-semibold leading-snug flex-1">{organization}</h3>
          {isNew && (
            <span className="flex-shrink-0 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-200 text-xs font-semibold whitespace-nowrap">
              🔥 NEW
            </span>
          )}
        </div>
        <p className="text-white/90 font-medium">{internshipTitle}</p>

        <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs text-white/90 ${isCompact ? 'gap-1' : ''}`}>
          <span className="rounded-full px-3 py-1 bg-white/10">🟢 {internship.mode || 'Mode NA'}</span>
          <span className="rounded-full px-3 py-1 bg-white/10">💰 {internship.stipend || 'Stipend NA'}</span>
          <span className="rounded-full px-3 py-1 bg-white/10">⏱ {internship.duration || 'Duration NA'}</span>
          <span className={`rounded-full px-3 py-1 ${urgencyBadgeClass}`}>{deadlineText}</span>
        </div>

        {!isCompact && skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill) => (
              <span key={skill} className="rounded-full px-3 py-1 text-xs bg-white/10 text-secondary-text">
                {skill}
              </span>
            ))}
          </div>
        )}

        {!isCompact && skills.length === 0 && (
          <div className="text-sm text-secondary-text">No skills listed.</div>
        )}

        {!isCompact && <div className="text-xs text-secondary-text">Tap card for details</div>}
      </div>

      <div className="mt-4 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
        {internship.registration_link ? (
          <a
            href={internship.registration_link}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ size: 'sm' })}
          >
            Apply Now
          </a>
        ) : (
          <button disabled className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'text-white/70' })}>
            Apply link unavailable
          </button>
        )}
      </div>
    </article>
  );
}
