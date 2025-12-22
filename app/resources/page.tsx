import { MOCK_RESOURCES } from '../../data/mock/resources';
import ResourceList from '../../components/resources/ResourceList';

export default function ResourcesPage() {
  return (
    <section>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Resources</h2>
          <p className="mt-2 text-sm text-secondary-text">Browse curated, exam-focused resources organized by branch, semester, subject, and module.</p>
        </div>

        <ResourceList items={MOCK_RESOURCES} />
      </div>
    </section>
  );
}
