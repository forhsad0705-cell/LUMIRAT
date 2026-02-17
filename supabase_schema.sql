-- Create the songs table
create table songs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null default 'Untitled',
  lyrics text default '', -- Used for lyric text
  chords text default '', -- Used for chords data if stored separately, but we mostly use inline
  content text default '', -- Optional: Store combined [C]Lyrics format here if preferred
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table songs enable row level security;

-- Policy: Users can view their own songs
create policy "Users can view own songs" on songs
  for select using (auth.uid() = user_id);

-- Policy: Users can insert their own songs
create policy "Users can insert own songs" on songs
  for insert with check (auth.uid() = user_id);

-- Policy: Users can update their own songs
create policy "Users can update own songs" on songs
  for update using (auth.uid() = user_id);

-- Policy: Users can delete their own songs
create policy "Users can delete own songs" on songs
  for delete using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table songs;
