'use client'

import { useMemo, useState } from 'react';
import type { Resource } from '../../data/mock/resources';
import ResourceCard from './ResourceCard';

export default function ResourceList({ items }: { items: Resource[] }) {
  const branches = useMemo(() => Array.from(new Set(items.map((r) => r.branch))), [items]);
  const [branch, setBranch] = useState<string>(branches[0] ?? '');

  const semesters = useMemo(() => {
    return Array.from(new Set(items.filter((r) => (branch ? r.branch === branch : true)).map((r) => r.semester))).sort((a, b) => a - b);
  }, [items, branch]);
  const [semester, setSemester] = useState<number | ''>(semesters[0] ?? '');

  const subjects = useMemo(() => {
    return Array.from(new Set(items.filter((r) => (semester ? r.semester === semester : true) && (!branch || r.branch === branch)).map((r) => r.subject)));
  }, [items, branch, semester]);
  const [subject, setSubject] = useState<string>(subjects[0] ?? '');

  const modules = useMemo(() => {
    return Array.from(new Set(items.filter((r) => (!subject || r.subject === subject)).map((r) => r.module)));
  }, [items, subject]);
  const [moduleSel, setModuleSel] = useState<string>(modules[0] ?? '');

  // compute filtered
  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (branch && r.branch !== branch) return false;
      if (semester && r.semester !== semester) return false;
      if (subject && r.subject !== subject) return false;
      if (moduleSel && r.module !== moduleSel) return false;
      return true;
    });
  }, [items, branch, semester, subject, moduleSel]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary-text mr-2">Branch</label>
          <select value={branch} onChange={(e) => { setBranch(e.target.value); setSemester(''); setSubject(''); setModuleSel(''); }} className="rounded-md bg-[#07102a] text-sm px-3 py-1">
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary-text mr-2">Semester</label>
          <select value={semester ?? ''} onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : '')} className="rounded-md bg-[#07102a] text-sm px-3 py-1">
            <option value="">All</option>
            {semesters.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary-text mr-2">Subject</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="rounded-md bg-[#07102a] text-sm px-3 py-1">
            <option value="">All</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-secondary-text mr-2">Module</label>
          <select value={moduleSel} onChange={(e) => setModuleSel(e.target.value)} className="rounded-md bg-[#07102a] text-sm px-3 py-1">
            <option value="">All</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <ResourceCard key={r.id} resource={r} />
        ))}
      </div>

      {filtered.length === 0 && <div className="mt-6 text-sm text-secondary-text">No resources found for selected filters.</div>}
    </div>
  );
}
