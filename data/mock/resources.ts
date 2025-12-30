// MOCK DATA — Replace with real backend data when available
// Purpose: Frontend-only mock resource list for the Resources page UI
// NOTE: This file is intentionally simple and mocked; replace with real backend data later.

export type ResourceType = 'Notes' | 'PYQ' | 'Playlist' | 'Solution' | 'Reference' | 'Assignment' | 'PPT';
export type ExamRelevance = 'Mid-sem' | 'End-sem' | 'Both';

export interface Resource {
  id: string;
  branch: string; // e.g., CSE, ECE
  semester: number;
  subject: string;
  module: string;
  title: string;
  type: ResourceType;
  examRelevance: ExamRelevance;
  description: string;
  url: string; // external link placeholder
  // Optional playlist metadata (only meaningful when type === 'Playlist')
  platform?: 'YouTube';
  coverage?: string; // e.g., "Covers all modules" or "Module 2 & 3"
}

export const MOCK_RESOURCES: Resource[] = [
  // Data Structures — Trees & Graphs
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
  {
    id: 'r7',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Tree Problems — Worked Solutions',
    type: 'Solution',
    examRelevance: 'Both',
    description: 'Problem set with step-by-step solutions and exam tips for common question formats.',
    url: '#',
  },
  {
    id: 'p1',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Graphs & Trees — Complete Playlist',
    type: 'Playlist',
    platform: 'YouTube',
    coverage: 'Module covers Trees & Graphs (full)',
    examRelevance: 'Both',
    description: 'A recommended YouTube playlist that covers trees and graph traversals with problem walkthroughs.',
    url: '#',
  },

  // Data Structures — Sorting & Searching
  {
    id: 'r8',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Sorting & Searching',
    title: 'Sorting Algorithms — Notes & Complexity Table',
    type: 'Notes',
    examRelevance: 'Mid-sem',
    description: 'Comparison of popular sorting algorithms with use-cases and complexity notes.',
    url: '#',
  },
  {
    id: 'p2',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Sorting & Searching',
    title: 'Sorting Algorithms Playlist (Top 10 Tutorials)',
    type: 'Playlist',
    platform: 'YouTube',
    coverage: 'Covers Sorting (Module 2)',
    examRelevance: 'Mid-sem',
    description: 'Short, focused videos on each sorting algorithm commonly tested in exams.',
    url: '#',
  },

  // Operating Systems
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
    id: 'p3',
    branch: 'CSE',
    semester: 5,
    subject: 'Operating Systems',
    module: 'Processes & Threads',
    title: 'Processes & Threads — Concept Playlist',
    type: 'Playlist',
    platform: 'YouTube',
    coverage: 'Module-level coverage',
    examRelevance: 'End-sem',
    description: 'Conceptual videos and small demos — good for quick exam revision.',
    url: '#',
  },

  // Digital Electronics — reference & solutions
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
    id: 'r9',
    branch: 'ECE',
    semester: 3,
    subject: 'Digital Electronics',
    module: 'Combinatorics',
    title: 'Reference: Karnaugh Maps Summary',
    type: 'Reference',
    examRelevance: 'Both',
    description: 'A quick reference sheet for Karnaugh maps and common simplifications.',
    url: '#',
  },

  // Sample Assignment and PPT entries to populate tabs
  {
    id: 'a1',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Trees & Graphs',
    title: 'Tree Practice Assignment 1',
    type: 'Assignment',
    examRelevance: 'Mid-sem',
    description: 'Assignment with programming and short-answer questions focused on tree traversals.',
    url: '#',
  },
  {
    id: 'ppt1',
    branch: 'CSE',
    semester: 3,
    subject: 'Data Structures',
    module: 'Sorting & Searching',
    title: 'Sorting Algorithms — Lecture PPT',
    type: 'PPT',
    examRelevance: 'Mid-sem',
    description: 'Slide deck covering sorting algorithms, complexities, and examples.',
    url: '#',
  },
];
