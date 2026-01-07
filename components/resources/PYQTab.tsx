"use client";

import type { Resource } from '../../data/mock/resources';

interface PYQTabProps {
  resources: Resource[];
}

export default function PYQTab({ resources }: PYQTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Mid Semester PYQs</h3>
        <ul className="list-disc ml-6 text-sm text-gray-600">
          <li>DBMS - Mid Sem 2023</li>
          <li>OS – Mid Sem 2022</li>
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">End Semester PYQs</h3>
        <ul className="list-disc ml-6 text-sm text-gray-600">
          <li>DBMS – End Sem 2023</li>
          <li>OS – End Sem 2022</li>
        </ul>
      </div>
    </div>
  );
}
