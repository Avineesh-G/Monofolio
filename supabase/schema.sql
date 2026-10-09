-- =========================================================
-- Monofolio PostgreSQL Database Schema (Supabase)
-- Single-user / Multi-tenant Row-Level Security Enabled
-- =========================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view and manage their own profile." on public.profiles
  for all using (auth.uid() = id);

-- 2. Semesters Table
create table if not exists public.semesters (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  name text not null,
  is_active boolean default true,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.semesters enable row level security;
create policy "Users can manage their own semesters." on public.semesters
  for all using (auth.uid() = user_id);

-- 3. Subjects Table
create table if not exists public.subjects (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  semester_id text references public.semesters on delete cascade,
  name text not null,
  color text not null default '#d0bcff',
  icon text default 'BookOpen',
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.subjects enable row level security;
create policy "Users can manage their own subjects." on public.subjects
  for all using (auth.uid() = user_id);

-- 4. Topics Table
create table if not exists public.topics (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id text references public.subjects on delete cascade,
  name text not null,
  mastery int default 0,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.topics enable row level security;
create policy "Users can manage their own topics." on public.topics
  for all using (auth.uid() = user_id);

-- 5. Items (Documents, Notes, Links) Table
create table if not exists public.items (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  subject_id text references public.subjects on delete cascade,
  topic_id text,
  kind text not null check (kind in ('pdf', 'note', 'link')),
  title text not null,
  body text,
  url text,
  link_note text,
  file_path text,
  file_hash text,
  page_count int,
  text_length int,
  thumbnail text,
  starred boolean default false,
  created_at bigint not null,
  updated_at bigint not null
);

alter table public.items enable row level security;
create policy "Users can manage their own items." on public.items
  for all using (auth.uid() = user_id);

-- 6. Flashcards Table (Leitner 5-Box SRS Engine)
create table if not exists public.flashcards (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  item_id text references public.items on delete cascade,
  topic_id text,
  subject_id text,
  q text not null,
  a text not null,
  explanation text,
  box int default 0 check (box between 0 and 4),
  due_at bigint not null,
  created_at bigint not null
);

alter table public.flashcards enable row level security;
create policy "Users can manage their own flashcards." on public.flashcards
  for all using (auth.uid() = user_id);

-- 7. Coach Analyses Table
create table if not exists public.coach_analyses (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null default auth.uid(),
  item_id text references public.items on delete cascade,
  file_hash text not null,
  prompt_version int not null,
  concepts jsonb not null,
  weak_spots jsonb not null,
  learning_order jsonb not null,
  plan jsonb not null,
  reality_check text not null,
  created_at bigint not null
);

alter table public.coach_analyses enable row level security;
create policy "Users can manage their own coach analyses." on public.coach_analyses
  for all using (auth.uid() = user_id);
