import Link from 'next/link';

export type SupabaseEvent = {
  id: string;
  title: string;
  organizer: string;
  description: string | null;
  category: string;
  mode: string;
  college: string | null;
  location: string | null;
  event_date: string | null;
  registration_link: string | null;
  company?: string | null;
  duration?: string | null;
  stipend?: string | null;
  skills?: string | null;
  deadline?: string | null;
  role?: string | null;
  organization?: string | null;
  eligibility?: string | null;
  pdf_url?: string | null;
};

export default function EventCard({ event }: { event: SupabaseEvent }) {
  const displayDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  return (
    <article className="glass rounded-xl p-6 min-h-[260px] flex flex-col justify-between border border-white/10 hover:border-white/20 transition-shadow">
      <div className="space-y-3">
        <h3 className="text-lg font-display font-semibold leading-snug">{event.title}</h3>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Organizer</span>
            <span className="text-white font-medium leading-snug">{event.organizer}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Date</span>
            <span className="text-white font-medium leading-snug">{displayDate}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Mode</span>
            <span className="text-white font-medium leading-snug"><span className="px-2 py-0.5 rounded-md bg-white/3 text-xs">{event.mode}</span></span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Location</span>
            <span className="text-white font-medium leading-snug">{event.location || event.college || '—'}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Event Type</span>
            <span className="text-white font-medium leading-snug">{event.category}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link href={`/events/${event.id}`} className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">View Details</Link>
      </div>
    </article>
  );
}
