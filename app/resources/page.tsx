import ResourcesTabs from '../../components/resources/ResourcesTabs';

export default function ResourcesPage() {
  return (
    <section>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Resources</h2>
          <p className="mt-2 text-sm text-secondary-text">Browse curated, exam-focused resources organized by branch, semester, subject, and module. Expand a module to see Study Resources grouped into Notes / PYQs / Solutions / Reference, and a separate "Recommended Playlists" section for YouTube playlists.</p>
        </div>

        <ResourcesTabs />
      </div>
    </section>
  );
}
