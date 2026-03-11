import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) return notFound();

  const displayDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/events" className="text-sm text-secondary-text underline">← Back to Events</Link>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <h1 className="text-2xl font-display font-bold">{event.title}</h1>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-secondary-text">
              <div>
                <div className="text-xs text-secondary-text">Organizer</div>
                <div className="text-sm text-white/90">{event.organizer}</div>
              </div>

              <div>
                <div className="text-xs text-secondary-text">Date</div>
                <div className="text-sm text-white/90">{displayDate}</div>
              </div>

              <div>
                <div className="text-xs text-secondary-text">Mode</div>
                <div className="text-sm text-white/90">{event.mode}</div>
              </div>

              <div>
                <div className="text-xs text-secondary-text">College</div>
                <div className="text-sm text-white/90">{event.college}</div>
              </div>

              <div>
                <div className="text-xs text-secondary-text">Location</div>
                <div className="text-sm text-white/90">{event.location || ''}</div>
              </div>

              <div>
                <div className="text-xs text-secondary-text">Category</div>
                <div className="text-sm text-white/90">{event.category}</div>
              </div>

              {event.description && (
                <div className="col-span-2 mt-4">
                  <div className="text-xs text-secondary-text mb-1">Description</div>
                  <p className="text-sm text-white/80 leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="glass rounded-xl p-4 h-full flex flex-col justify-between border border-white/10 hover:border-white/20">
              <div className="h-56 bg-gradient-to-br from-[#06b6d4] to-[#a855f7] rounded-md" />

              <div className="mt-4">
                {event.registration_link ? (
                  <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">Register</a>
                ) : (
                  <button disabled className="inline-flex items-center px-4 py-2 rounded-xl bg-white/6 text-secondary-text">Registration link not available</button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
