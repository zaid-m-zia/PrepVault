"use client";

import { MOCK_RESOURCES } from '../../data/mock/resources';
import ResourceList from './ResourceList';

export default function AssignmentsTab() {
  const items = MOCK_RESOURCES.filter((r) => r.type === 'Assignment');

  if (items.length === 0) {
    return <div className="text-sm text-secondary-text">No assignments available yet.</div>;
  }

  return <ResourceList items={items} />;
}
