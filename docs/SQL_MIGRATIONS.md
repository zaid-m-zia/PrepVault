# Supabase SQL Migrations for PrepVault Networking

Run these SQL statements in your Supabase SQL editor to set up the networking system tables.

## Phase 1: Follow System

```sql
-- Create follows table
create table if not exists follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(follower_id, following_id)
);

-- Enable RLS
alter table follows enable row level security;

-- RLS Policies for follows
create policy "Users can view their own follows"
  on follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

create policy "Users can create follow requests"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can update their follow requests"
  on follows for update
  using (auth.uid() = following_id)
  with check (auth.uid() = following_id);

create policy "Users can delete their follows"
  on follows for delete
  using (auth.uid() = follower_id or auth.uid() = following_id);

-- Index for faster queries
create index idx_follows_follower on follows(follower_id);
create index idx_follows_following on follows(following_id);
create index idx_follows_status on follows(status);
```

## Phase 2: Messages System

```sql
-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table messages enable row level security;

-- RLS Policies for messages
create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update read status"
  on messages for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Index for faster queries
create index idx_messages_sender on messages(sender_id);
create index idx_messages_recipient on messages(recipient_id);
create index idx_messages_created_at on messages(created_at);
```

## Phase 3: Notifications System

```sql
-- Create notifications table
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete cascade,
  type text check (type in ('follow_request', 'follow_accepted', 'message')) not null,
  related_id uuid,
  is_read boolean default false,
  created_at timestamp default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- RLS Policies for notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on notifications for insert
  with check (true);

create policy "Users can update their notification read status"
  on notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for faster queries
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_is_read on notifications(is_read);
```

## Update profiles table (if not already done)

```sql
-- Add columns to profiles table if they don't exist
alter table profiles 
add column if not exists bio text,
add column if not exists avatar_url text,
add column if not exists college text,
add column if not exists branch text,
add column if not exists skills text[],
add column if not exists github text,
add column if not exists linkedin text,
add column if not exists leetcode text,
add column if not exists created_at timestamp default now(),
add column if not exists updated_at timestamp default now();
```

## Phase 4: Projects + Achievements

```sql
-- Create projects table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  tech_stack text[] default '{}',
  github_link text,
  demo_link text,
  created_at timestamp default now()
);

alter table projects enable row level security;

create policy "Anyone can view projects"
  on projects for select
  using (true);

create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

create index if not exists idx_projects_user_id on projects(user_id);

-- Create achievements table
create table if not exists achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  event text,
  year int,
  created_at timestamp default now()
);

alter table achievements enable row level security;

create policy "Anyone can view achievements"
  on achievements for select
  using (true);

create policy "Users can insert own achievements"
  on achievements for insert
  with check (auth.uid() = user_id);

create policy "Users can update own achievements"
  on achievements for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own achievements"
  on achievements for delete
  using (auth.uid() = user_id);

create index if not exists idx_achievements_user_id on achievements(user_id);
```

