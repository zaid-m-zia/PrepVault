'use client'

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import EventCard, { type SupabaseEvent } from '../../components/events/EventCard';
import InternshipCard from '../../components/events/InternshipCard';
import InternshipDetailsModal from '../../components/events/InternshipDetailsModal';
import TrendingOpportunitiesSection from '../../components/events/TrendingOpportunitiesSection';

const MODES = ['Online', 'Offline', 'Hybrid'] as const;
const CATEGORIES = ['Hackathon', 'Tech Fest', 'Competition', 'Coding Challenge', 'Conference', 'Tech Workshop', 'Internship'] as const;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export default function EventsPage() {
  const [trendingOpportunities, setTrendingOpportunities] = useState<SupabaseEvent[]>([]);
  const [featuredInternships, setFeaturedInternships] = useState<SupabaseEvent[]>([]);
  const [otherOpportunities, setOtherOpportunities] = useState<SupabaseEvent[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<SupabaseEvent | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchColleges = useCallback(async () => {
    const { data } = await supabase
      .from('events')
      .select('college')
      .not('college', 'is', null);

    const uniqueColleges = Array.from(new Set((data ?? []).map((item: { college: string | null }) => item.college).filter(Boolean) as string[])).sort();
    setColleges(uniqueColleges);
  }, []);

  const fetchTrendingOpportunities = useCallback(async () => {
    const { data: trendingData } = await supabase
      .from('events')
      .select('*')
      .eq('category', 'Internship')
      .not('deadline', 'is', null)
      .order('deadline', { ascending: true })
      .limit(5);

    setTrendingOpportunities(trendingData ?? []);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    let internshipsQuery = supabase
      .from('events')
      .select('*')
      .eq('category', 'Internship')
      .order('deadline', { ascending: true });

    if (selectedMode) internshipsQuery = internshipsQuery.eq('mode', selectedMode);
    if (selectedCollege) internshipsQuery = internshipsQuery.eq('college', selectedCollege);

    if (selectedCategory && selectedCategory !== 'Internship') {
      setFeaturedInternships([]);
    } else {
      const { data: internshipData } = await internshipsQuery;
      setFeaturedInternships(internshipData ?? []);
    }

    let othersQuery = supabase
      .from('events')
      .select('*')
      .not('category', 'eq', 'Internship')
      .order('event_date', { ascending: true });

    if (selectedMode) othersQuery = othersQuery.eq('mode', selectedMode);
    if (selectedCollege) othersQuery = othersQuery.eq('college', selectedCollege);

    if (selectedCategory === 'Internship') {
      setOtherOpportunities([]);
    } else {
      if (selectedCategory) othersQuery = othersQuery.eq('category', selectedCategory);
      const { data: otherData } = await othersQuery;
      setOtherOpportunities(otherData ?? []);
    }

    setLoading(false);
  }, [selectedMode, selectedCategory, selectedCollege]);

  useEffect(() => {
    fetchColleges();
    fetchTrendingOpportunities();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggle = (value: string, current: string | null, setter: (v: string | null) => void) => {
    setter(current === value ? null : value);
  };

  const openInternshipDetails = (internship: SupabaseEvent) => {
    setSelectedInternship(internship);
    setDetailsOpen(true);
  };

  const closeInternshipDetails = () => {
    setDetailsOpen(false);
    setSelectedInternship(null);
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-display font-bold">Opportunities</h1>
          <p className="mt-2 text-sm text-secondary-text">Discover internships, workshops, competitions, and more.</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Mode:</span>
            <div className="flex gap-2 flex-wrap">
              {MODES.map((m) => (
                <button key={m} onClick={() => toggle(m, selectedMode, setSelectedMode)} className={`px-3 py-1 rounded-full text-sm ${selectedMode === m ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Category:</span>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => toggle(c, selectedCategory, setSelectedCategory)} className={`px-3 py-1 rounded-full text-sm ${selectedCategory === c ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">College:</span>
            <div className="flex gap-2 flex-wrap">
              {colleges.map((college) => (
                <button key={college} onClick={() => toggle(college, selectedCollege, setSelectedCollege)} className={`px-3 py-1 rounded-full text-sm ${selectedCollege === college ? 'bg-accent text-[#0a0e27]' : 'glass text-secondary-text'}`}>
                  {college}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && trendingOpportunities.length > 0 && (
          <TrendingOpportunitiesSection opportunities={trendingOpportunities} onOpenDetails={openInternshipDetails} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-6 min-h-[260px] border border-white/10 animate-pulse">
                <div className="h-5 bg-white/10 rounded mb-4 w-3/4" />
                <div className="space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10">
              <header className="mb-4">
                <h2 className="text-xl font-display font-semibold">Featured Internships</h2>
                <p className="mt-1 text-sm text-secondary-text">Discover internship opportunities curated from PrepVault.</p>
              </header>
              {featuredInternships.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredInternships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} onOpenDetails={openInternshipDetails} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-secondary-text">No internships match the selected filters.</div>
              )}
            </div>

            <div>
              <header className="mb-4">
                <h2 className="text-xl font-display font-semibold">Upcoming Opportunities</h2>
                <p className="mt-1 text-sm text-secondary-text">Events, workshops, hackathons, and other opportunities.</p>
              </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherOpportunities.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
              {otherOpportunities.length === 0 && (
              <div className="mt-6 text-sm text-secondary-text">No events match the selected filters.</div>
            )}
            </div>
          </>
        )}
      </div>

      <InternshipDetailsModal
        internship={selectedInternship}
        open={detailsOpen}
        onClose={closeInternshipDetails}
      />
    </section>
  );
}
