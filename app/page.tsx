import Link from 'next/link';
// HomePage component (server-side)
// Purpose: Landing page with hero section introducing PrepVault and call-to-action button
export default function HomePage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="mx-auto w-full max-w-3xl text-center px-4">
        <div className="glass p-8 md:p-12 rounded-lg">
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
 <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-from to-accent-to">
    PrepVault
  </span>
  <br />
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-from to-accent-to">
    Your all-in-one student success hub
  </span>
</h1>

          <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">
            From curated study resources and past papers to finding teammates for hackathons, Exploring Events, and collaboration opportunities — everything you need to learn, build, grow, and win, all in one place.
          </p>

          <div className="mt-8 flex justify-center">
            {/* Client-side navigation using Next.js Link (styles preserved) */}
            <Link href="/resources" className="inline-block rounded-lg px-6 py-3 bg-cta text-[#0a0e27] font-semibold shadow-glow hover:opacity-95">
              Explore Resources
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}