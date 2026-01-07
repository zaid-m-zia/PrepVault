// ResourceCard — presentational component for a single resource
// Purpose: Show resource title, type, exam relevance, description and external link button

import type { Resource } from '../../data/mock/resources';

export default function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="glass group rounded-lg p-4 border transform-gpu transition-transform duration-150 hover:shadow-lg hover:scale-105 hover:-translate-y-1 z-0 hover:z-10" style={{ borderColor: 'rgba(139,92,246,0.04)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold font-display leading-snug transition-colors group-hover:text-primary-text">{resource.title}</h3>
          <div className="mt-1 text-sm text-secondary-text">
            <span className="mr-3">{resource.type}</span>
            <span className="px-2 py-0.5 rounded-md bg-white/3 text-xs ml-2">{resource.examRelevance}</span>
          </div>
          <p className="mt-3 text-sm text-secondary-text">{resource.description}</p>
        </div>

        <div className="flex-shrink-0 flex items-center">
          <a
            href={resource.url}
            role="button"
            aria-label={`Open ${resource.title}`}
            className="ml-4 inline-flex items-center px-3 py-2 rounded-md bg-cta text-[#0a0e27] font-semibold focus:outline-none focus:ring-2 focus:ring-white/10"
            >
            Open
          </a>
        </div>
      </div>

      <div className="mt-3 text-xs text-secondary-text">
        <span className="mr-2">{resource.branch}</span>
        <span className="mr-2">Semester {resource.semester}</span>
        <span className="mr-2">{resource.subject} • {resource.module}</span>
      </div>
    </article>
  );
}
