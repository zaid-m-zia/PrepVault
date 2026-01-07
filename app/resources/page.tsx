"use client";

import { useMemo, useState } from 'react';
import ResourcesTabs from '../../components/resources/ResourcesTabs';
import { MOCK_RESOURCES, type Resource } from '../../data/mock/resources';

export default function ResourcesPage() {
  const items: Resource[] = MOCK_RESOURCES;

  const branches = useMemo(() => Array.from(new Set(items.map((r) => r.branch))), [items]);
  const [branch, setBranch] = useState<string>(branches[0] ?? '');

  const semesters = useMemo(() => {
    return Array.from(new Set(items.filter((r) => (branch ? r.branch === branch : true)).map((r) => r.semester))).sort((a, b) => a - b);
  }, [items, branch]);
  const [semester, setSemester] = useState<number | ''>(semesters[0] ?? '');

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(items.filter((r) => (semester ? r.semester === semester : true) && (!branch || r.branch === branch)).map((r) => r.subject)));
  }, [items, branch, semester]);
  const [subject, setSubject] = useState<string>(subjectOptions[0] ?? '');

  const modules = useMemo(() => Array.from(new Set(items.filter((r) => (!subject || r.subject === subject)).map((r) => r.module))), [items, subject]);
  const [moduleSel, setModuleSel] = useState<string>(modules[0] ?? '');

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
    <section>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold">Resources</h2>
          <p className="mt-2 text-sm text-secondary-text">Browse curated, exam-focused resources organized by branch, semester, subject, and module. Expand a module to see Study Resources grouped into Notes / PYQs / Solutions / Reference, and a separate "Recommended Playlists" section for YouTube playlists.</p>
        </div>

        {/* Global filter bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
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
                {subjectOptions.map((s) => (
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
        </div>

        <ResourcesTabs resources={filtered} />
      </div>
    </section>
  );
}
