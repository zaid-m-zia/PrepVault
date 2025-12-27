'use client'

import { useState } from 'react';
import TeamCard from '../../components/hackhub/TeamCard';
import UserCard from '../../components/hackhub/UserCard';
import { mockTeams } from '../../data/mock/teams';
import { mockUsers } from '../../data/mock/users';

export default function HackHubPage() {
  const [tab, setTab] = useState<'teams' | 'users' | 'create'>('teams');

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-display font-bold">HackHub</h1>
          <p className="mt-2 text-sm text-secondary-text">Find teams, build teams, and meet hackers like you.</p>
        </header>

        <div className="mb-6">
          <div className="inline-flex rounded-full bg-white/3 p-1">
            <button onClick={() => setTab('teams')} className={`px-4 py-2 rounded-full text-sm ${tab === 'teams' ? 'bg-accent text-[#0a0e27]' : 'text-secondary-text'}`}>Find Teams</button>
            <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-full text-sm ${tab === 'users' ? 'bg-accent text-[#0a0e27]' : 'text-secondary-text'}`}>Find Teammates</button>
            <button onClick={() => setTab('create')} className={`px-4 py-2 rounded-full text-sm ${tab === 'create' ? 'bg-accent text-[#0a0e27]' : 'text-secondary-text'}`}>Create Team</button>
          </div>
        </div>

        <div className="min-h-[240px]">
          {tab === 'teams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeams.map((t) => (
                <TeamCard key={t.id} team={t} />
              ))}
            </div>
          )}

          {tab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUsers.map((u) => (
                <UserCard key={u.id} user={u} />
              ))}
            </div>
          )}

          {tab === 'create' && (
            <div className="max-w-2xl">
              <CreateTeamForm />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CreateTeamForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [lookingFor, setLookingFor] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      description,
      skillsRequired: skills.split(',').map((s) => s.trim()).filter(Boolean),
      lookingFor: lookingFor.split(',').map((s) => s.trim()).filter(Boolean),
    };
    console.log('Create team payload', payload);
    // reset
    setName('');
    setDescription('');
    setSkills('');
    setLookingFor('');
  }

  return (
    <form onSubmit={onSubmit} className="glass rounded-xl p-6 border border-white/10">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Team Name</label>
          <input className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Description</label>
          <textarea className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Skills Required (comma separated)</label>
          <input className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2" value={skills} onChange={(e) => setSkills(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-gray-400">Looking For / Roles (comma separated)</label>
          <input className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2" value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} />
        </div>

        <div className="pt-2">
          <button type="submit" className="inline-flex items-center px-4 py-2 rounded-xl bg-accent text-[#0a0e27] font-semibold">Create Team</button>
        </div>
      </div>
    </form>
  );
}
