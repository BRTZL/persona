-- Individual message tracking for rate limiting
-- Stores each user message independently of conversation deletion
create table message_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  message_id uuid references messages(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Index for efficient querying (count per user per day)
create index idx_message_usage_log_user_date
  on message_usage_log(user_id, created_at);

-- RLS
alter table message_usage_log enable row level security;

create policy "Users can view own usage logs" on message_usage_log
  for select using (auth.uid() = user_id);

-- Trigger function to track user messages
create or replace function track_user_message()
returns trigger language plpgsql security definer as $$
declare
  v_user_id uuid;
begin
  -- Only track user messages, not assistant
  if NEW.role != 'user' then
    return NEW;
  end if;

  -- Get user_id from conversation
  select user_id into v_user_id
  from conversations where id = NEW.conversation_id;

  if v_user_id is null then
    return NEW;
  end if;

  -- Insert tracking record
  insert into message_usage_log (user_id, message_id)
  values (v_user_id, NEW.id);

  return NEW;
end;
$$;

-- Trigger on message insert
create trigger trg_track_user_message
  after insert on messages
  for each row
  execute function track_user_message();

-- Function to check current usage (aggregates tracking table)
create or replace function get_daily_message_usage(p_user_id uuid)
returns table(message_count integer, daily_limit integer, remaining integer)
language plpgsql security definer stable as $$
declare
  v_daily_limit constant integer := 15;
  v_current_count integer;
begin
  select count(*)::integer into v_current_count
  from message_usage_log
  where user_id = p_user_id
    and created_at >= current_date
    and created_at < current_date + interval '1 day';

  return query select
    v_current_count as message_count,
    v_daily_limit as daily_limit,
    greatest(0, v_daily_limit - v_current_count) as remaining;
end;
$$;

