"use client";

import ResourceList from './ResourceList';
import type { Resource } from '../../data/mock/resources';

export default function PPTTab({ resources }: { resources: Resource[] }) {
  const items = resources.filter((r) => r.type === 'PPT');

  if (items.length === 0) {
    return <div className="text-sm text-secondary-text">No PPTs available yet.</div>;
  }

  return <ResourceList items={items} />;
}
