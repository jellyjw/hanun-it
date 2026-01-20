-- Create release_notes table
create table if not exists release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  title text not null,
  description text,
  content text not null,
  released_at timestamptz not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_published boolean default true
);

-- Create index for better performance on date sorting
create index if not exists idx_release_notes_released_at on release_notes(released_at desc);

-- Enable Row Level Security
alter table release_notes enable row level security;

-- Policy: Anyone can view published release notes
create policy "Anyone can view published release notes"
  on release_notes for select
  using (is_published = true);

-- Policy: Authenticated users can insert (admin check done in API)
create policy "Authenticated users can insert release notes"
  on release_notes for insert
  with check (auth.uid() is not null);

-- Policy: Authenticated users can update (admin check done in API)
create policy "Authenticated users can update release notes"
  on release_notes for update
  using (auth.uid() is not null);

-- Policy: Authenticated users can delete (admin check done in API)
create policy "Authenticated users can delete release notes"
  on release_notes for delete
  using (auth.uid() is not null);
