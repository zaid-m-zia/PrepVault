'use client'

import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { events } from '../../data/mock/events';
import EventCard from '../../components/events/EventCard';
import { conferences } from '../../data/mock/conferences';
import type { Conference } from '../../data/mock/conferences';
import ConferenceCard from '../../components/events/ConferenceCard';

const MODES = ['Online', 'Offline', 'Hybrid'] as const;
const CATEGORIES = ['Hackathon', 'Tech Fest', 'Competition', 'Cultural Fest', 'Coding Challenge', 'Conference'] as const;
const COLLEGES = ['Amity University', 'DTU', 'NSUT', 'IGDTUW', 'IPU', 'IIITD', 'Open to All'] as const;

export default function EventsPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (selectedMode && e.mode !== selectedMode) return false;
      if (selectedCategory && e.category !== selectedCategory) return false;
      if (selectedCollege && e.location !== selectedCollege) return false;
      return true;
    });
  }, [selectedMode, selectedCategory, selectedCollege]);

  const toggle = (value: string | null, setter: Dispatch<SetStateAction<string | null>>) => {
    setter((current) => (current === value ? null : value));
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-display font-bold">Upcoming Events & Hackathons</h1>
          <p className="mt-2 text-sm text-secondary-text">Discover opportunities to learn, compete, and grow.</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Mode:</span>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button key={m} onClick={() => toggle(m, setSelectedMode)} className={`px-3 py-1 rounded-full text-sm ${selectedMode === m ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Category:</span>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => toggle(c, setSelectedCategory)} className={`px-3 py-1 rounded-full text-sm ${selectedCategory === c ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">College:</span>
            <div className="flex gap-2">
              {COLLEGES.map((col) => (
                <button key={col} onClick={() => toggle(col, setSelectedCollege)} className={`px-3 py-1 rounded-full text-sm ${selectedCollege === col ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Conferences Section */}
        <div className="mt-12 mb-16">
          <header className="mb-4">
            <h2 className="text-xl font-display font-semibold">Conferences</h2>
            <p className="mt-1 text-sm text-secondary-text">Academic & research conferences</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {conferences.map((c: Conference) => (
              <ConferenceCard key={c.id} conference={c} />
            ))}
          </div>
        </div>
        {/* Uniform grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>

        {filtered.length === 0 && <div className="mt-6 text-sm text-secondary-text">No events match the selected filters.</div>}

        
      </div>
    </section>
  );
}
