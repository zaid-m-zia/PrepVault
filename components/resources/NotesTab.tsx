"use client";

import ResourceList from './ResourceList';
import type { Resource } from '../../data/mock/resources';

export default function NotesTab({ resources }: { resources: Resource[] }) {
  const items = resources.filter((r) => r.type === 'Notes');
  return <ResourceList items={items} />;
}
