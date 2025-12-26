-- Favorite Characters
create table favorite_characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  character_slug text not null,
  created_at timestamptz default now(),
  unique(user_id, character_slug)
);

-- Index for fast lookups
create index idx_favorite_characters_user_id on favorite_characters(user_id);

-- RLS
alter table favorite_characters enable row level security;

create policy "Users own favorites" on favorite_characters
  for all using (auth.uid() = user_id);
