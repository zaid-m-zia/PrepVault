import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center">
      <div className="mx-auto w-full max-w-3xl text-center px-4">
        <div className="glass p-8 md:p-12 rounded-lg">
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-accent-from to-accent-to">
            PrepVault — Centralized, exam-focused resources
          </h1>

          <p className="mt-4 text-lg text-secondary-text max-w-2xl mx-auto">
            Curated notes, past papers, solutions, and hand-picked playlists organized by branch, semester, subject, and module — everything you need to prepare confidently for mid and end semester exams.
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