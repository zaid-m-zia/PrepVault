'use client'

import { useState } from 'react';
import type { Resource } from '../../data/mock/resources';
import ResourceCard from './ResourceCard';
import PlaylistCard from './PlaylistCard';
import SectionHeader from './SectionHeader';

export default function ModuleAccordion({ moduleName, resources, playlists }: { moduleName: string; resources: Resource[]; playlists: Array<{ id: string; title: string; platform?: string; coverage?: string; examRelevance: string; url: string }>; }) {
  const [open, setOpen] = useState(true);

  const notes = resources.filter((r) => r.type === 'Notes');
  const pyqs = resources.filter((r) => r.type === 'PYQ');
  const solutions = resources.filter((r) => r.type === 'Solution');
  const references = resources.filter((r) => r.type === 'Reference');

  return (
    <div className="border-t border-white/4 pt-4">
      <button aria-expanded={open} onClick={() => setOpen((s) => !s)} className="w-full flex items-center justify-between py-2">
        <div>
          <h2 className="text-lg font-display font-semibold">{moduleName}</h2>
          <p className="mt-1 text-sm text-secondary-text">Study Resources · {notes.length} notes · {pyqs.length} PYQs · {solutions.length} solutions · {playlists.length} playlists</p>
        </div>
        <div className="text-secondary-text">{open ? '▾' : '▸'}</div>
      </button>

      {open && (
        <div className="mt-4 space-y-6">
          <section aria-labelledby={`${moduleName}-study`}>
            <SectionHeader title="Study Resources" subtitle="Notes · PYQs · Solutions · Reference" />

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((r) => <ResourceCard key={r.id} resource={r} />)}
              {pyqs.map((r) => <ResourceCard key={r.id} resource={r} />)}
              {solutions.map((r) => <ResourceCard key={r.id} resource={r} />)}
              {references.map((r) => <ResourceCard key={r.id} resource={r} />)}

              {notes.length + pyqs.length + solutions.length + references.length === 0 && (
                <div className="col-span-1 md:col-span-2 text-sm text-secondary-text">No study resources added yet for this module.</div>
              )}
            </div>
          </section>

          <section aria-labelledby={`${moduleName}-playlists`}>
            <SectionHeader title="Recommended Playlists" subtitle="Curated YouTube playlists" />

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlists.map((p) => (
                <PlaylistCard key={p.id} playlist={p} />
              ))}

              {playlists.length === 0 && <div className="col-span-1 md:col-span-2 text-sm text-secondary-text">More playlists coming soon.</div>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
