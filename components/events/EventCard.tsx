import Link from 'next/link';
import type { Event } from '../../data/mock/events';

export default function EventCard({ event }: { event: Event }) {
  return (
    <article className="glass rounded-xl p-6 min-h-[260px] flex flex-col justify-between border border-white/10 hover:border-white/20 transition-shadow">
      <div className="space-y-3">
        <h3 className="text-lg font-display font-semibold leading-snug">{event.title}</h3>

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Date</span>
            <span className="text-white font-medium leading-snug">{event.date}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Time</span>
            <span className="text-white font-medium leading-snug">{event.time ?? '—'}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Mode</span>
            <span className="text-white font-medium leading-snug"><span className="px-2 py-0.5 rounded-md bg-white/3 text-xs">{event.mode}</span></span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">College</span>
            <span className="text-white font-medium leading-snug">{event.location}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Event Type</span>
            <span className="text-white font-medium leading-snug">{event.category}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Paid</span>
            <span className="text-white font-medium leading-snug">{event.tags?.includes('Paid') ? 'Yes' : 'No'}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-gray-400">Team/Solo</span>
            <span className="text-white font-medium leading-snug">{event.tags?.includes('Team') ? 'Team' : event.tags?.includes('Solo') ? 'Solo' : '—'}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link href={`/events/${event.id}`} className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">View Details</Link>
      </div>
    </article>
  );
}
