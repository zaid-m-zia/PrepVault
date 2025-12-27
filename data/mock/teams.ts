// MOCK DATA — Teams for HackHub (frontend-only; replace with backend later)
export type Team = {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  skillsRequired: string[];
  lookingFor?: string[]; // positions needed
};

export const mockTeams: Team[] = [
  {
    id: 'waste-wizard-1',
    name: 'Waste Wizard',
    description: 'A project to identify and segregate waste using robotics and image processing.',
    createdBy: 'Yash',
    skillsRequired: ['AI', 'Robotics', 'Machine Learning'],
    lookingFor: ['Frontend Dev', 'Mechanical Engineer'],
  },
  {
    id: 'ai-health-2',
    name: 'AI Health Monitor',
    description: 'Wearable-based health monitoring with anomaly detection models for early alerts.',
    createdBy: 'Priya',
    skillsRequired: ['ML', 'Embedded', 'Backend'],
    lookingFor: ['Frontend Dev', 'Data Engineer'],
  },
  {
    id: 'food-rescue-3',
    name: 'Food Rescue',
    description: 'Logistics platform to redirect surplus food from events to shelters.',
    createdBy: 'Aman',
    skillsRequired: ['Fullstack', 'Mobile'],
    lookingFor: ['Android Dev', 'UI/UX Designer'],
  },
  {
    id: 'solar-grid-4',
    name: 'Solar Grid Optimizer',
    description: 'Optimization tools for small-scale solar microgrids for campus buildings.',
    createdBy: 'Ritu',
    skillsRequired: ['Optimization', 'Python', 'Data'],
    lookingFor: ['Backend Dev'],
  },
  {
    id: 'edu-games-5',
    name: 'Edu Games',
    description: 'Short interactive games to teach programming fundamentals to beginners.',
    createdBy: 'Karan',
    skillsRequired: ['Frontend', 'GameDev'],
    lookingFor: ['Frontend Dev', 'Artist'],
  },
  {
    id: 'assistive-ai-6',
    name: 'Assistive AI',
    description: 'Voice-enabled assistant for students with reading disabilities.',
    createdBy: 'Meera',
    skillsRequired: ['NLP', 'Frontend'],
    lookingFor: ['Frontend Dev', 'UX Researcher'],
  },
  {
    id: 'neon-deploy-7',
    name: 'Neon Deploy',
    description: 'Simple deployment pipelines for student projects, with templates and docs.',
    createdBy: 'Vikram',
    skillsRequired: ['DevOps', 'Docker'],
    lookingFor: ['Backend Dev'],
  },
  {
    id: 'health-hack-8',
    name: 'Health Hack',
    description: 'Hackathon team for rapid prototyping of healthcare ideas with mentors.',
    createdBy: 'Sara',
    skillsRequired: ['Fullstack', 'ML'],
    lookingFor: ['Data Scientist', 'Frontend Dev'],
  },
  {
    id: 'open-source-9',
    name: 'Open Source Brigade',
    description: 'A team focused on contributing to open source projects and mentorship.',
    createdBy: 'Nikhil',
    skillsRequired: ['Git', 'JavaScript'],
    lookingFor: ['Contributors'],
  },
];
