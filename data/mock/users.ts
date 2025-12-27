// MOCK DATA — Users seeking teams (frontend-only; replace later)
export type User = {
  id: string;
  name: string;
  skills: string[];
  lookingFor: string; // preferred role
  bio?: string;
};

export const mockUsers: User[] = [
  { id: 'u1', name: 'Rohan', skills: ['React', 'TypeScript'], lookingFor: 'Frontend', bio: 'Full-time student building UI components.' },
  { id: 'u2', name: 'Anita', skills: ['Python', 'ML'], lookingFor: 'Data', bio: 'ML enthusiast, loves experiments and papers.' },
  { id: 'u3', name: 'Sam', skills: ['DevOps', 'Docker'], lookingFor: 'Backend', bio: 'Deployment-focused, CI/CD experience.' },
  { id: 'u4', name: 'Priya', skills: ['UI/UX', 'Figma'], lookingFor: 'Design', bio: 'Design-first approach for product teams.' },
  { id: 'u5', name: 'Rahul', skills: ['Node.js', 'Postgres'], lookingFor: 'Backend', bio: 'API design and database performance.' },
  { id: 'u6', name: 'Zara', skills: ['Flutter', 'Mobile'], lookingFor: 'Mobile', bio: 'Mobile app dev with UX focus.' },
  { id: 'u7', name: 'Isha', skills: ['ML', 'NLP'], lookingFor: 'Data', bio: 'NLP researcher working on low-resource languages.' },
  { id: 'u8', name: 'Dev', skills: ['Arduino', 'Embedded'], lookingFor: 'Hardware', bio: 'Hardware prototyping and sensors.' },
];
