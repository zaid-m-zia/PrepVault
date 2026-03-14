'use client'

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../../lib/supabaseClient';
import TeamCard, { type HackHubTeam } from '../../components/hackhub/TeamCard';
import UserCard, { type HackHubUser } from '../../components/hackhub/UserCard';
import Button from '../../components/ui/Button';

export default function HackHubPage() {
  const [tab, setTab] = useState<'teams' | 'users' | 'create'>('teams');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [teams, setTeams] = useState<HackHubTeam[]>([]);
  const [users, setUsers] = useState<HackHubUser[]>([]);
  const router = useRouter();

  const joinedTeamIds = useMemo(
    () => new Set(teams.filter((team) => team.joined).map((team) => team.id)),
    [teams]
  );

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id ?? null;

      if (!mounted) return;
      setCurrentUserId(userId);

      await Promise.all([loadTeams(userId), loadUsers(userId)]);
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  async function loadTeams(userId: string | null) {
    setLoadingTeams(true);
    try {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name, description, tech_stack, looking_for, created_by, created_at')
        .order('created_at', { ascending: false });

      const resolvedTeams = teamsData ?? [];

      const creatorIds = Array.from(new Set(resolvedTeams.map((team: any) => team.created_by).filter(Boolean)));
      let creatorMap = new Map<string, { full_name?: string | null; username?: string | null }>();

      if (creatorIds.length > 0) {
        const { data: creatorsData } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', creatorIds);

        creatorMap = new Map(
          (creatorsData ?? []).map((profile: any) => [profile.id, { full_name: profile.full_name, username: profile.username }])
        );
      }

      let joinedIds = new Set<string>();
      if (userId) {
        const { data: membershipData } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId);

        joinedIds = new Set((membershipData ?? []).map((row: any) => row.team_id));
      }

      const hydratedTeams: HackHubTeam[] = resolvedTeams.map((team: any) => {
        const creator = creatorMap.get(team.created_by);
        const createdByName = creator?.full_name || creator?.username || 'Unknown';

        return {
          id: team.id,
          name: team.name || 'Untitled Team',
          description: team.description || 'No description provided.',
          techStack: Array.isArray(team.tech_stack) ? team.tech_stack : [],
          lookingFor: Array.isArray(team.looking_for) ? team.looking_for : [],
          createdByName,
          joined: joinedIds.has(team.id),
        };
      });

      setTeams(hydratedTeams);
    } catch (error) {
      console.error('Failed to load teams:', error);
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }

  async function loadUsers(userId: string | null) {
    setLoadingUsers(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, bio, skills, looking_for')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.neq('id', userId);
      }

      const { data } = await query;

      const teammates: HackHubUser[] = (data ?? []).map((profile: any) => {
        const skills = Array.isArray(profile.skills)
          ? profile.skills.filter((item: unknown) => typeof item === 'string' && item.trim())
          : [];

        const lookingFor = Array.isArray(profile.looking_for)
          ? profile.looking_for.filter((item: unknown) => typeof item === 'string' && item.trim())
          : typeof profile.looking_for === 'string' && profile.looking_for.trim()
            ? profile.looking_for.split(',').map((value: string) => value.trim()).filter(Boolean)
            : ['Collaborators'];

        return {
          id: profile.id,
          name: profile.full_name || profile.username || 'Unnamed User',
          bio: profile.bio || 'No bio added yet.',
          skills,
          lookingFor,
        };
      });

      setUsers(teammates);
    } catch (error) {
      console.error('Failed to load teammates:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleJoinTeam(teamId: string) {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    if (joinedTeamIds.has(teamId)) return;

    setJoiningTeamId(teamId);
    try {
      const { data: existingMembership } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (!existingMembership) {
        const { error } = await supabase
          .from('team_members')
          .insert({ team_id: teamId, user_id: currentUserId });

        if (error) throw error;
      }

      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId ? { ...team, joined: true } : team
        )
      );
    } catch (error) {
      console.error('Failed to join team:', error);
    } finally {
      setJoiningTeamId(null);
    }
  }

  async function handleCreateTeam(payload: {
    name: string;
    description: string;
    techStack: string[];
    lookingFor: string[];
  }) {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setCreatingTeam(true);
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: payload.name,
          description: payload.description,
          tech_stack: payload.techStack,
          looking_for: payload.lookingFor,
          created_by: currentUserId,
        });

      if (error) throw error;

      await loadTeams(currentUserId);
      setTab('teams');
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreatingTeam(false);
    }
  }

  function handleConnect(userId: string) {
    router.push(`/chat?user=${encodeURIComponent(userId)}`);
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-display font-bold">HackHub</h1>
          <p className="mt-2 text-sm text-secondary-text">Find teams, build teams, and meet hackers like you.</p>
        </header>

        <div className="mb-6">
          <div className="inline-flex rounded-full bg-white/3 p-1">
            <button onClick={() => setTab('teams')} className={`px-4 py-2 rounded-full text-sm ${tab === 'teams' ? 'bg-accent text-white font-semibold' : 'text-secondary-text'}`}>Find Teams</button>
            <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-full text-sm ${tab === 'users' ? 'bg-accent text-white font-semibold' : 'text-secondary-text'}`}>Find Teammates</button>
            <button onClick={() => setTab('create')} className={`px-4 py-2 rounded-full text-sm ${tab === 'create' ? 'bg-accent text-white font-semibold' : 'text-secondary-text'}`}>Create Team</button>
          </div>
        </div>

        <div className="min-h-[240px]">
          {tab === 'teams' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingTeams ? (
                <div className="col-span-full text-sm text-secondary-text">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="col-span-full text-sm text-secondary-text">No teams found yet. Create the first team.</div>
              ) : (
                teams.map((team) => (
                  <TeamCard
                    key={team.id}
                    team={team}
                    onJoin={handleJoinTeam}
                    joining={joiningTeamId === team.id}
                  />
                ))
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingUsers ? (
                <div className="col-span-full text-sm text-secondary-text">Loading teammates...</div>
              ) : users.length === 0 ? (
                <div className="col-span-full text-sm text-secondary-text">No teammates found.</div>
              ) : (
                users.map((user) => (
                  <UserCard key={user.id} user={user} onConnect={handleConnect} />
                ))
              )}
            </div>
          )}

          {tab === 'create' && (
            <div className="max-w-2xl">
              <CreateTeamForm onSubmit={handleCreateTeam} creating={creatingTeam} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CreateTeamForm({
  onSubmit,
  creating,
}: {
  onSubmit: (payload: { name: string; description: string; techStack: string[]; lookingFor: string[] }) => Promise<void>;
  creating: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  function addTag(value: string, setter: Dispatch<SetStateAction<string[]>>) {
    const normalized = value.trim();
    if (!normalized) return;

    setter((prev) => {
      if (prev.some((tag) => tag.toLowerCase() === normalized.toLowerCase())) return prev;
      return [...prev, normalized];
    });
  }

  function removeTag(value: string, setter: Dispatch<SetStateAction<string[]>>) {
    setter((prev) => prev.filter((tag) => tag !== value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedTechInput = techStackInput.trim();
    const normalizedLookingForInput = lookingForInput.trim();

    const finalTechStack = normalizedTechInput
      ? Array.from(new Set([...techStack, normalizedTechInput]))
      : techStack;

    const finalLookingFor = normalizedLookingForInput
      ? Array.from(new Set([...lookingFor, normalizedLookingForInput]))
      : lookingFor;

    const payload = {
      name,
      description,
      techStack: finalTechStack,
      lookingFor: finalLookingFor,
    };

    if (!payload.name.trim() || !payload.description.trim()) return;

    await onSubmit(payload);

    setName('');
    setDescription('');
    setTechStackInput('');
    setLookingForInput('');
    setTechStack([]);
    setLookingFor([]);
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-xl p-6 border border-white/10">
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
          <label className="text-sm text-gray-400">Tech Stack (press Enter)</label>
          <input
            className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(techStackInput, setTechStack);
                setTechStackInput('');
              }
            }}
          />
          {techStack.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {techStack.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => removeTag(tag, setTechStack)}
                  className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400">Looking For / Roles (press Enter)</label>
          <input
            className="mt-1 block w-full rounded-md bg-[#07102a] px-3 py-2"
            value={lookingForInput}
            onChange={(e) => setLookingForInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(lookingForInput, setLookingFor);
                setLookingForInput('');
              }
            }}
          />
          {lookingFor.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {lookingFor.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => removeTag(tag, setLookingFor)}
                  className="rounded-full px-3 py-1 text-xs bg-white/3 text-secondary-text"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button type="submit" size="sm" disabled={creating}>{creating ? 'Creating...' : 'Create Team'}</Button>
        </div>
      </div>
    </form>
  );
}
