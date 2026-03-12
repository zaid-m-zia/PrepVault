'use client'

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import EventCard, { type SupabaseEvent } from '../../components/events/EventCard';
import InternshipCard from '../../components/events/InternshipCard';
import InternshipDetailsModal from '../../components/events/InternshipDetailsModal';
import TrendingOpportunitiesSection from '../../components/events/TrendingOpportunitiesSection';
import { buildOpportunityOrFilter, expandOpportunitySearchTerms, hasInternshipIntent, normalizeOpportunitySearchInput } from '../../lib/opportunityUtils';

const MODES = ['Online', 'Offline', 'Hybrid'] as const;
const CATEGORIES = ['Hackathon', 'Tech Fest', 'Competition', 'Coding Challenge', 'Conference', 'Tech Workshop', 'Internship'] as const;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

function EventsPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const normalizedSearchQuery = normalizeOpportunitySearchInput(searchQuery);
  const isSearchActive = normalizedSearchQuery.length > 0;

  const [trendingOpportunities, setTrendingOpportunities] = useState<SupabaseEvent[]>([]);
  const [upcomingHackathons, setUpcomingHackathons] = useState<SupabaseEvent[]>([]);
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

  const fetchUpcomingHackathons = useCallback(async () => {
    const { data: hackathonData } = await supabase
      .from('events')
      .select('*')
      .ilike('category', '%hackathon%')
      .order('event_date', { ascending: true })
      .limit(5);

    setUpcomingHackathons(hackathonData ?? []);
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);

    if (isSearchActive) {
      const expandedTerms = expandOpportunitySearchTerms(normalizedSearchQuery);
      const orFilter = buildOpportunityOrFilter(expandedTerms);
      const internshipIntent = hasInternshipIntent(normalizedSearchQuery);

      let searchEventsQuery = supabase
        .from('events')
        .select('*');

      if (orFilter) searchEventsQuery = searchEventsQuery.or(orFilter);
      if (selectedMode) searchEventsQuery = searchEventsQuery.eq('mode', selectedMode);
      if (selectedCollege) searchEventsQuery = searchEventsQuery.eq('college', selectedCollege);
      if (selectedCategory) searchEventsQuery = searchEventsQuery.eq('category', selectedCategory);
      if (internshipIntent) searchEventsQuery = searchEventsQuery.eq('category', 'Internship');

      searchEventsQuery = internshipIntent
        ? searchEventsQuery.order('deadline', { ascending: true })
        : searchEventsQuery.order('created_at', { ascending: false });

      const { data: searchResults } = await searchEventsQuery;
      const results = searchResults ?? [];

      setFeaturedInternships(results.filter((opportunity) => opportunity.category === 'Internship'));
      setOtherOpportunities(results.filter((opportunity) => opportunity.category !== 'Internship'));
      setLoading(false);
      return;
    }

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
  }, [isSearchActive, normalizedSearchQuery, selectedMode, selectedCategory, selectedCollege]);

  useEffect(() => {
    fetchColleges();
    fetchTrendingOpportunities();
    fetchUpcomingHackathons();
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
          <p className="mt-2 text-sm text-secondary-text">
            {isSearchActive
              ? `Showing smart results for "${normalizedSearchQuery}"`
              : 'Discover internships, workshops, competitions, and more.'}
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Mode:</span>
            <div className="flex gap-2 flex-wrap">
              {MODES.map((m) => (
                <button key={m} onClick={() => toggle(m, selectedMode, setSelectedMode)} className={`px-3 py-1 rounded-full text-sm ${selectedMode === m ? 'bg-accent text-white' : 'glass text-secondary-text'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">Category:</span>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => toggle(c, selectedCategory, setSelectedCategory)} className={`px-3 py-1 rounded-full text-sm ${selectedCategory === c ? 'bg-accent text-white' : 'glass text-secondary-text'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-text mr-2">College:</span>
            <div className="flex gap-2 flex-wrap">
              {colleges.map((college) => (
                <button key={college} onClick={() => toggle(college, selectedCollege, setSelectedCollege)} className={`px-3 py-1 rounded-full text-sm ${selectedCollege === college ? 'bg-accent text-white' : 'glass text-secondary-text'}`}>
                  {college}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && !isSearchActive && trendingOpportunities.length > 0 && (
          <TrendingOpportunitiesSection opportunities={trendingOpportunities} onOpenDetails={openInternshipDetails} />
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4 overflow-visible">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-visible flex justify-center">
                <div className="glass rounded-xl p-6 min-h-[260px] border border-white/10 animate-pulse w-full">
                  <div className="h-5 bg-white/10 rounded mb-4 w-3/4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-10">
              <header className="mb-4">
                <h2 className="text-xl font-display font-semibold">{isSearchActive ? 'Internship Matches' : 'Featured Internships'}</h2>
                <p className="mt-1 text-sm text-secondary-text">
                  {isSearchActive
                    ? 'Smart matches from internship role, organization, skills, location, and description.'
                    : 'Discover internship opportunities curated from PrepVault.'}
                </p>
              </header>
              {featuredInternships.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4 overflow-visible">
                  {featuredInternships.map((internship) => (
                    <div key={internship.id} className="overflow-visible flex justify-center">
                      <InternshipCard internship={internship} onOpenDetails={openInternshipDetails} highlightQuery={normalizedSearchQuery} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-secondary-text">
                  {isSearchActive ? 'No internship matches found for your query.' : 'No internships match the selected filters.'}
                </div>
              )}
            </div>

            <div>
              <header className="mb-4">
                <h2 className="text-xl font-display font-semibold">{isSearchActive ? 'Event Matches' : 'Upcoming Opportunities'}</h2>
                <p className="mt-1 text-sm text-secondary-text">
                  {isSearchActive
                    ? 'Smart matches from category, organization, location, and event description.'
                    : 'Events, workshops, hackathons, and other opportunities.'}
                </p>
              </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-4 overflow-visible">
                {otherOpportunities.map((e) => (
                <div key={e.id} className="overflow-visible flex justify-center">
                  <EventCard event={e} highlightQuery={normalizedSearchQuery} />
                </div>
              ))}
            </div>
              {otherOpportunities.length === 0 && (
              <div className="mt-6 text-sm text-secondary-text">
                {isSearchActive ? 'No event matches found for your query.' : 'No events match the selected filters.'}
              </div>
            )}
            </div>

            {isSearchActive && featuredInternships.length === 0 && otherOpportunities.length === 0 && (
              <div className="mt-8 space-y-8">
                <div className="glass rounded-xl p-5 border border-white/10">
                  <h3 className="text-lg font-display font-semibold">No exact results found</h3>
                  <p className="mt-2 text-sm text-secondary-text">
                    Try broader keywords like internship, hackathon, workshop, competition, or conference.
                  </p>
                </div>

                {trendingOpportunities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-3">Trending internships</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-4 overflow-visible">
                      {trendingOpportunities.slice(0, 3).map((internship) => (
                        <div key={internship.id} className="overflow-visible flex justify-center">
                          <InternshipCard internship={internship} onOpenDetails={openInternshipDetails} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingHackathons.length > 0 && (
                  <div>
                    <h3 className="text-lg font-display font-semibold mb-3">Upcoming hackathons</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-4 overflow-visible">
                      {upcomingHackathons.slice(0, 3).map((hackathon) => (
                        <div key={hackathon.id} className="overflow-visible flex justify-center">
                          <EventCard event={hackathon} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="h-7 w-48 bg-white/10 rounded animate-pulse" />
          </div>
        </section>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}
