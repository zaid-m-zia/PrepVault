import Link from 'next/link';
import SearchBar from '../components/search/SearchBar';
import { buttonClasses } from '../components/ui/Button';
// HomePage component (server-side)
// Purpose: Landing page with hero section introducing PrepVault and call-to-action button
export default function HomePage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">PrepVault</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          A focused platform to discover opportunities, study resources, and collaborators.
        </p>

        <div className="mt-8 max-w-2xl mx-auto">
          <SearchBar className="flex items-center gap-2" />
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/resources" className={buttonClasses({ className: 'px-6 py-3' })}>
            Explore Resources
          </Link>
          <Link href="/events" className={buttonClasses({ variant: 'secondary', className: 'px-6 py-3' })}>
            Browse Opportunities
          </Link>
        </div>
      </div>
    </section>
  );
}