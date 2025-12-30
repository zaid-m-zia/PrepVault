"use client";

import { MOCK_RESOURCES } from '../../data/mock/resources';
import PlaylistCard from './PlaylistCard';

export default function PlaylistTab() {
  const items = MOCK_RESOURCES.filter((r) => r.type === 'Playlist');

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
