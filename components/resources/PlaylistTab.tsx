"use client";

import PlaylistCard from './PlaylistCard';
import type { Resource } from '../../data/mock/resources';

export default function PlaylistTab({ resources }: { resources: Resource[] }) {
  const items = resources.filter((r) => r.type === 'Playlist');

  if (items.length === 0) {
    return <div className="text-sm text-secondary-text">No playlists found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((p) => (
        <PlaylistCard
          key={p.id}
          playlist={{ id: p.id, title: p.title, platform: p.platform, coverage: p.coverage, examRelevance: p.examRelevance, url: p.url }}
        />
      ))}
    </div>
  );
}
