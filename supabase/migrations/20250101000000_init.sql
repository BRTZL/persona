-- Characters (predefined AI personas)
create table characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  avatar_url text not null,
  system_prompt text not null,
  description text,
  created_at timestamptz default now()
);

-- Conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  character_id uuid references characters not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_conversations_user_id on conversations(user_id);
create index idx_conversations_updated_at on conversations(updated_at desc);
create index idx_messages_conversation_id on messages(conversation_id);

-- RLS
alter table characters enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "Characters readable by authenticated" on characters
  for select using (auth.role() = 'authenticated');

create policy "Users own conversations" on conversations
  for all using (auth.uid() = user_id);

create policy "Users access own messages" on messages
  for all using (
    conversation_id in (select id from conversations where user_id = auth.uid())
  );

-- Seed characters
insert into characters (name, slug, avatar_url, system_prompt, description) values
  ('Luna', 'luna', '/avatars/luna.png',
   'You are Luna, a friendly and knowledgeable assistant. You are helpful, warm, and always eager to assist with any question.',
   'Helpful Assistant'),
  ('Rex', 'rex', '/avatars/rex.png',
   'You are Rex, a technical coding expert. You provide precise, well-structured code examples and explain technical concepts clearly.',
   'Coding Guru'),
  ('Sage', 'sage', '/avatars/sage.png',
   'You are Sage, a creative writer with a vivid imagination. You craft eloquent prose and help with creative projects.',
   'Creative Writer'),
  ('Max', 'max', '/avatars/max.png',
   'You are Max, an energetic fitness coach. You motivate users and provide practical health and fitness advice.',
   'Fitness Coach');
