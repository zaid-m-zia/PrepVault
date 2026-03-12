// ResourceCard — presentational component for a single resource
// Purpose: Show resource title, type, exam relevance, description and external link button

import type { Resource } from '../../data/mock/resources';
import { buttonClasses } from '../ui/Button';

export default function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="group rounded-lg p-4 border border-gray-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700 transform-gpu transition-transform duration-150 hover:shadow-md hover:scale-105 hover:-translate-y-1 z-0 hover:z-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold font-display leading-snug text-slate-900 dark:text-white transition-colors group-hover:text-primary-text">{resource.title}</h3>
          <div className="mt-1 text-sm text-slate-600 dark:text-secondary-text">
            <span className="mr-3">{resource.type}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-xs ml-2">{resource.examRelevance}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-secondary-text">{resource.description}</p>
        </div>

        <div className="flex-shrink-0 flex items-center">
          <a
            href={resource.url}
            role="button"
            aria-label={`Open ${resource.title}`}
            className={buttonClasses({ size: 'sm', className: 'ml-4 rounded-md' })}
            >
            Open
          </a>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-600 dark:text-secondary-text">
        <span className="mr-2">{resource.branch}</span>
        <span className="mr-2">Semester {resource.semester}</span>
        <span className="mr-2">{resource.subject} • {resource.module}</span>
      </div>
    </article>
  );
}
