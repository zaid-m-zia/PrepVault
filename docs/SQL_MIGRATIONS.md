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
add column if not exists created_at timestamp default now();
```

