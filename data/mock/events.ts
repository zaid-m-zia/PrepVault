// MOCK DATA — Events (frontend-only mock data). Replace with real API later.
export type Event = {
  id: string;
  title: string;
  date: string; // e.g., "Jan 25, 2026"
  time?: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  location: string; // college or 'Open to All'
  category: 'Hackathon' | 'Tech Fest' | 'Competition' | 'Cultural Fest' | 'Coding Challenge';
  tags?: string[]; // e.g., ['Team', 'Free']
  link?: string;
};

export const events: Event[] = [
  { id: 'e1', title: 'Intercol CS Hackathon — Build for Impact', date: 'Jan 25, 2026', time: '10:00 AM', mode: 'Hybrid', location: 'Amity University', category: 'Hackathon', tags: ['Team', 'Free'], link: '#' },
  { id: 'e2', title: 'DTU Tech Fest 2026', date: 'Feb 12, 2026', mode: 'Offline', location: 'DTU', category: 'Tech Fest', tags: ['Free'], link: '#' },
  { id: 'e3', title: 'Open Algorithm Competition', date: 'Mar 3, 2026', time: '2:00 PM', mode: 'Online', location: 'Open to All', category: 'Competition', tags: ['Solo', 'Paid'], link: '#' },
  { id: 'e4', title: 'Women in Tech — Mini Hack', date: 'Mar 20, 2026', mode: 'Offline', location: 'NSUT', category: 'Hackathon', tags: ['Team', 'Free'] },
  { id: 'e5', title: 'IGDTUW Creative Coding Challenge', date: 'Apr 5, 2026', mode: 'Hybrid', location: 'IGDTUW', category: 'Coding Challenge', tags: ['Solo'], link: '#' },
  { id: 'e6', title: 'Open Source Week — Contribute & Learn', date: 'Apr 23, 2026', mode: 'Online', location: 'Open to All', category: 'Tech Fest', tags: ['Free'], link: '#' },

  { id: 'e7', title: 'IPU Cultural Fest — Rhythm & Code', date: 'May 1, 2026', mode: 'Offline', location: 'IPU', category: 'Cultural Fest', tags: ['Free'] },
  { id: 'e8', title: 'IIITD Night Hack — Rapid Prototyping', date: 'May 8, 2026', time: '6:00 PM', mode: 'Offline', location: 'IIITD', category: 'Hackathon', tags: ['Team', 'Paid'], link: '#' },
  { id: 'e9', title: 'Campus Coding Challenge — Binary Sprint', date: 'May 15, 2026', mode: 'Online', location: 'Open to All', category: 'Coding Challenge', tags: ['Solo', 'Paid'], link: '#' },
  { id: 'e10', title: 'NSUT Interdepartment Fest', date: 'May 21, 2026', mode: 'Hybrid', location: 'NSUT', category: 'Cultural Fest', tags: ['Free'] },
  { id: 'e11', title: 'Amity AI Hackathon', date: 'Jun 2, 2026', mode: 'Offline', location: 'Amity University', category: 'Hackathon', tags: ['Team', 'Paid'], link: '#' },
  { id: 'e12', title: 'DTU Students DevSprint', date: 'Jun 10, 2026', mode: 'Online', location: 'DTU', category: 'Coding Challenge', tags: ['Team', 'Free'], link: '#' },

  { id: 'e13', title: 'Open Robotics Challenge', date: 'Jun 19, 2026', mode: 'Offline', location: 'Open to All', category: 'Competition', tags: ['Team', 'Paid'] },
  { id: 'e14', title: 'IGDTUW Hack for Her', date: 'Jun 25, 2026', mode: 'Hybrid', location: 'IGDTUW', category: 'Hackathon', tags: ['Team', 'Free'] },
  { id: 'e15', title: 'Spring Tech Fest — Workshops & Demos', date: 'Jul 3, 2026', mode: 'Online', location: 'Open to All', category: 'Tech Fest', tags: ['Free'] },
  { id: 'e16', title: 'IIITD Creative Coding Carnival', date: 'Jul 12, 2026', mode: 'Offline', location: 'IIITD', category: 'Cultural Fest', tags: ['Free'] },
  { id: 'e17', title: 'IPU Hack Night — Microservices', date: 'Jul 20, 2026', mode: 'Online', location: 'IPU', category: 'Hackathon', tags: ['Solo', 'Paid'], link: '#' },
  { id: 'e18', title: 'Community Coding Marathon', date: 'Aug 1, 2026', mode: 'Online', location: 'Open to All', category: 'Coding Challenge', tags: ['Team', 'Free'], link: '#' },
];
