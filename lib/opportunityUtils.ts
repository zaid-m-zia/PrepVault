/**
 * Calculate days remaining until deadline
 */
export const getDaysRemaining = (deadline: string | undefined | null): number | null => {
  if (!deadline) return null;
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysLeft;
};

/**
 * Get urgency level based on days remaining
 */
export const getUrgencyLevel = (daysRemaining: number | null): 'critical' | 'warning' | 'normal' | null => {
  if (daysRemaining === null) return null;
  if (daysRemaining <= 1) return 'critical';
  if (daysRemaining <= 3) return 'critical';
  if (daysRemaining <= 7) return 'warning';
  return 'normal';
};

/**
 * Get deadline urgency badge text
 */
export const getDeadlineText = (deadline: string | undefined | null): string => {
  const daysRemaining = getDaysRemaining(deadline);
  if (daysRemaining === null) return '📅 Deadline NA';
  if (daysRemaining <= 0) return '🔥 Deadline Today';
  if (daysRemaining === 1) return '🔥 Tomorrow';
  if (daysRemaining <= 3) return `🔥 ${daysRemaining} days left`;
  if (daysRemaining <= 7) return `⏳ ${daysRemaining} days left`;
  return `📅 ${Math.floor(daysRemaining)} days left`;
};

/**
 * Check if opportunity is newly created (within 48 hours)
 */
export const isNewOpportunity = (createdAt: string | undefined | null): boolean => {
  if (!createdAt) return false;
  const hoursAgo = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return hoursAgo < 48;
};

/**
 * Get badge color class based on urgency level
 */
export const getUrgencyBadgeClass = (urgency: 'critical' | 'warning' | 'normal' | null): string => {
  switch (urgency) {
    case 'critical':
      return 'bg-red-500/20 border border-red-500/30 text-red-200';
    case 'warning':
      return 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-200';
    case 'normal':
      return 'bg-white/10';
    default:
      return 'bg-white/10';
  }
};

const OPPORTUNITY_KEYWORD_MAP: Record<string, string[]> = {
  internship: ['internship', 'intern', 'swe intern', 'summer intern', 'remote internship', 'stipend'],
  hackathon: ['hackathon', 'hack', 'coding hackathon'],
  workshop: ['workshop', 'bootcamp', 'tech workshop'],
  competition: ['competition', 'coding contest', 'challenge', 'coding challenge'],
  conference: ['conference', 'summit', 'meetup'],
};

const escapeLikeTerm = (value: string): string => value.replace(/[%_,]/g, ' ').trim();

export const normalizeOpportunitySearchInput = (query: string): string =>
  query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');

export const expandOpportunitySearchTerms = (query: string): string[] => {
  const normalized = normalizeOpportunitySearchInput(query);
  if (!normalized) return [];

  const terms = new Set<string>([normalized, ...normalized.split(' ').filter(Boolean)]);

  Object.entries(OPPORTUNITY_KEYWORD_MAP).forEach(([key, aliases]) => {
    const shouldInclude = normalized.includes(key) || aliases.some((alias) => normalized.includes(alias));
    if (shouldInclude) {
      terms.add(key);
      aliases.forEach((alias) => terms.add(alias));
    }
  });

  return Array.from(terms)
    .map(escapeLikeTerm)
    .filter(Boolean)
    .slice(0, 10);
};

export const hasInternshipIntent = (query: string): boolean => {
  const normalized = normalizeOpportunitySearchInput(query);
  const internshipAliases = OPPORTUNITY_KEYWORD_MAP.internship;
  return internshipAliases.some((alias) => normalized.includes(alias));
};

export const buildOpportunityOrFilter = (terms: string[]): string => {
  if (terms.length === 0) return '';
  const columns = ['role', 'organization', 'category', 'skills', 'location', 'description', 'title'];
  return columns
    .flatMap((column) => terms.map((term) => `${column}.ilike.%${term}%`))
    .join(',');
};
