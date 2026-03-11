import { useEffect } from 'react';
import type { SupabaseEvent } from './EventCard';

type Props = {
  internship: SupabaseEvent | null;
  open: boolean;
  onClose: () => void;
};

export default function InternshipDetailsModal({ internship, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !internship) return null;

  const role = internship.role || internship.title || 'Internship Role';
  const organization = internship.organization || internship.company || 'Organization';
  const deadline = internship.deadline
    ? new Date(internship.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  const skills = internship.skills
    ? internship.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/70" onClick={onClose}>
      <div className="w-full max-w-3xl glass border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold">{role}</h2>
            <p className="text-secondary-text mt-1">{organization}</p>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded-lg glass border border-white/10 text-secondary-text hover:text-primary-text transition-colors">
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-text">
          <div>
            <div className="text-xs text-secondary-text">Mode</div>
            <div className="text-white/90">{internship.mode || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-secondary-text">Deadline</div>
            <div className="text-white/90">{deadline}</div>
          </div>
          <div>
            <div className="text-xs text-secondary-text">Duration</div>
            <div className="text-white/90">{internship.duration || '—'}</div>
          </div>
          <div>
            <div className="text-xs text-secondary-text">Salary / Stipend</div>
            <div className="text-white/90">{internship.stipend || '—'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-secondary-text">Eligibility</div>
            <div className="text-white/90">{internship.eligibility || '—'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-secondary-text">Skills</div>
            {skills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="rounded-full px-3 py-1 text-xs bg-white/10 text-secondary-text">{skill}</span>
                ))}
              </div>
            ) : (
              <div className="text-white/90">—</div>
            )}
          </div>
        </div>

        {internship.pdf_url && (
          <div className="mt-6">
            <div className="text-sm text-secondary-text mb-2">PDF Viewer</div>
            <iframe src={internship.pdf_url} className="w-full h-[45vh] rounded-xl border border-white/10 bg-black/20" title={role} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          {internship.pdf_url && (
            <a href={internship.pdf_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-xl glass border border-white/10 text-primary-text hover:border-white/20 transition-colors">
              View PDF
            </a>
          )}
          {internship.registration_link ? (
            <a href={internship.registration_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">
              Apply Now
            </a>
          ) : (
            <button disabled className="inline-flex items-center px-4 py-2 rounded-xl bg-white/6 text-secondary-text">Apply link unavailable</button>
          )}
        </div>
      </div>
    </div>
  );
}
