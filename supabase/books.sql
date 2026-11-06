-- supabase/books.sql
-- Drop table if exists
drop table if exists public.books cascade;

-- Create books table
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null,
  author text not null,
  pages integer not null,
  status text not null default 'To Read',
  created_at timestamptz not null default now(),

  -- Database constraints to refuse bad data
  constraint books_title_check check (length(trim(title)) > 0 and length(title) <= 80),
  constraint books_author_check check (length(trim(author)) > 0 and length(author) <= 60),
  constraint books_pages_check check (pages >= 1 and pages <= 5000),
  constraint books_status_check check (status in ('To Read', 'Reading', 'Finished'))
);

-- Indexes for performance
create index books_user_id_idx on public.books(user_id);
create index books_created_at_idx on public.books(created_at desc);

-- Enable Row Level Security (RLS)
alter table public.books enable row level security;

-- RLS Policies:
-- 1. Logged in users can view only their own rows
create policy "Users can view their own books"
  on public.books for select
  to authenticated
  using (auth.uid() = user_id);

-- 2. Logged in users can insert only with their own user_id
create policy "Users can insert their own books"
  on public.books for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 3. Logged in users can update only their own rows
create policy "Users can update their own books"
  on public.books for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Logged in users can delete only their own rows
create policy "Users can delete their own books"
  on public.books for delete
  to authenticated
  using (auth.uid() = user_id);

