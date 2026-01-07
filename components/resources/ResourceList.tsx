'use client'

import { useMemo } from 'react';
import type { Resource } from '../../data/mock/resources';
import ModuleAccordion from './ModuleAccordion';

export default function ResourceList({ items }: { items: Resource[] }) {
  // Group by module for accordion display
  const modulesGrouped = useMemo(() => {
    const map = new Map<string, { resources: Resource[]; playlists: Resource[] }>();
    for (const r of items) {
      const key = r.module || 'General';
      if (!map.has(key)) map.set(key, { resources: [], playlists: [] });
      const entry = map.get(key)!;
      if (r.type === 'Playlist') entry.playlists.push(r as Resource);
      else entry.resources.push(r);
    }
    return Array.from(map.entries()).map(([moduleName, data]) => ({ moduleName, ...data }));
  }, [items]);

  return (
    <div>
      <div className="space-y-6">
        {modulesGrouped.map((m) => (
          <ModuleAccordion key={m.moduleName} moduleName={m.moduleName} resources={m.resources} playlists={m.playlists.map((p) => ({ id: p.id, title: p.title, platform: (p as any).platform, coverage: (p as any).coverage, examRelevance: p.examRelevance, url: p.url }))} />
        ))}

        {items.length === 0 && <div className="mt-6 text-sm text-secondary-text">No resources found for selected filters.</div>}
      </div>
    </div>
  );
}
