"use client";

import { MOCK_RESOURCES } from '../../data/mock/resources';
import ResourceList from './ResourceList';

export default function NotesTab() {
  const items = MOCK_RESOURCES.filter((r) => r.type === 'Notes');
  return <ResourceList items={items} />;
}
