'use client'

import type { ReactNode } from 'react';
import { CalendarDays, Clock3, Laptop2, Sparkles, Wallet } from 'lucide-react';
import type { SupabaseEvent } from './EventCard';
import { getDeadlineText, getDaysRemaining, getUrgencyLevel, getUrgencyBadgeClass, isNewOpportunity } from '../../lib/opportunityUtils';
import { buttonClasses } from '../ui/Button';

type Props = {
  internship: SupabaseEvent;
  onOpenDetails: (internship: SupabaseEvent) => void;
  isCompact?: boolean;
  highlightQuery?: string;
};

export default function InternshipCard({ internship, onOpenDetails, isCompact = false, highlightQuery }: Props) {
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

  const highlightText = (text: string): ReactNode => {
    const query = (highlightQuery ?? '').trim();
    if (!query) return text;

    const terms = query.split(' ').filter(Boolean).slice(0, 6);
    if (terms.length === 0) return text;

    const escapedTerms = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'ig');
    const parts = text.split(regex);
    const lowercaseTerms = terms.map((term) => term.toLowerCase());

    return parts.map((part, index) =>
      lowercaseTerms.includes(part.toLowerCase()) ? (
        <mark key={`${part}-${index}`} className="bg-cyan-400/25 text-white px-0.5 rounded">
          {part}
        </mark>
      ) : (
        <span key={`${part}-${index}`}>{part}</span>
      )
    );
  };

  const minHeightClass = isCompact ? 'min-h-[240px]' : 'min-h-[260px]';

  return (
    <article
      onClick={() => onOpenDetails(internship)}
      className={`relative transform-gpu origin-center will-change-transform transition-all duration-300 hover:scale-[1.02] rounded-xl p-6 ${minHeightClass} w-full max-w-xl flex flex-col justify-between border border-slate-700/80 bg-slate-900/70 hover:border-indigo-500/80 hover:shadow-xl cursor-pointer`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-display font-semibold leading-snug flex-1">{highlightText(organization)}</h3>
          {isNew && (
            <span className="inline-flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 text-xs font-semibold whitespace-nowrap">
              <Sparkles className="h-3 w-3" />
              NEW
            </span>
          )}
        </div>
        <p className="text-white/90 font-medium">{highlightText(internshipTitle)}</p>

        <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs text-white/90 ${isCompact ? 'gap-1' : ''}`}>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-slate-800/80 border border-slate-700/60">
            <Laptop2 className="h-3 w-3" />
            {internship.mode || 'Mode NA'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-slate-800/80 border border-slate-700/60">
            <Wallet className="h-3 w-3" />
            {internship.stipend || 'Stipend NA'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 bg-slate-800/80 border border-slate-700/60">
            <Clock3 className="h-3 w-3" />
            {internship.duration || 'Duration NA'}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${urgencyBadgeClass}`}>
            <CalendarDays className="h-3 w-3" />
            {deadlineText}
          </span>
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
