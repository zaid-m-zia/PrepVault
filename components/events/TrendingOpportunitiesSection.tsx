'use client'

import { motion } from 'framer-motion';
import type { SupabaseEvent } from './EventCard';
import InternshipCard from './InternshipCard';

type Props = {
  opportunities: SupabaseEvent[];
  onOpenDetails: (opportunity: SupabaseEvent) => void;
};

export default function TrendingOpportunitiesSection({ opportunities, onOpenDetails }: Props) {
  if (opportunities.length === 0) return null;

  return (
    <section className="mb-12 py-8 overflow-visible">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔥</span>
        <h2 className="text-xl font-display font-semibold">Trending Opportunities</h2>
      </div>
      <p className="text-sm text-secondary-text mb-4">Urgent internships with closest deadlines</p>

      <div className="overflow-x-auto overflow-y-visible scrollbar-hide px-2 md:px-4">
        <div className="flex gap-4 pb-4 pt-4 min-w-full overflow-visible">
          {opportunities.slice(0, 5).map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80 overflow-visible flex justify-center"
            >
              <InternshipCard internship={opportunity} onOpenDetails={onOpenDetails} isCompact />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
