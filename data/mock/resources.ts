// MOCK DATA — Replace with real backend data when available
// Purpose: Frontend-only mock resource list for the Resources page UI

export type ResourceType = 'Notes' | 'PYQ' | 'Playlist' | 'Solution';
export type ExamRelevance = 'Mid-sem' | 'End-sem' | 'Both';

export interface Resource {
  id: string;
  branch: string;
  semester: number;
  subject: string;
  module: string;
  title: string;
  type: ResourceType;
  examRelevance: ExamRelevance;
  description: string;
  url: string; // external link placeholder
}

export const MOCK_RESOURCES: Resource[] = [
  {
    id: 'r1',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Trees - Handwritten Notes by Senior',
    type: 'Notes',
    examRelevance: 'Both',
    description: 'Concise notes covering tree traversals, binary trees, and common problems with solved examples.',
    url: '#',
  },
  {
    id: 'r2',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Sorting & Searching',
    title: 'Sorting Algorithms — Short Video Playlist',
    type: 'Playlist',
    examRelevance: 'Mid-sem',
    description: 'A curated playlist focusing on sorts required for exam problems — comparison & stability discussed.',
    url: '#',
  },
  {
    id: 'r3',
    branch: 'CSE',
    semester: 5,
    subject: 'Operating Systems',
    module: 'Processes & Threads',
    title: 'OS Past Year Questions (2018-2024)',
    type: 'PYQ',
    examRelevance: 'End-sem',
    description: 'Collection of PYQs with short answers and references to standard textbooks.',
    url: '#',
  },
  {
    id: 'r4',
    branch: 'ECE',
    semester: 3,
    subject: 'Digital Electronics',
    module: 'Combinatorics',
    title: 'Digital Logic - Problem Sets with Solutions',
    type: 'Solution',
    examRelevance: 'Both',
    description: 'Selected problem sets with step-by-step solutions commonly asked in exams.',
    url: '#',
  },
  {
    id: 'r5',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Graph Traversals Cheatsheet',
    type: 'Notes',
    examRelevance: 'Mid-sem',
    description: 'One-page cheatsheet covering BFS/DFS patterns and complexity notes.',
    url: '#',
  },
  {
    id: 'r6',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Trees — Past Paper Questions',
    type: 'PYQ',
    examRelevance: 'End-sem',
    description: 'Past paper questions specifically on tree data structures with short solutions.',
    url: '#',
  },
];
