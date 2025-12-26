-- Daily message usage tracking for rate limiting
create table daily_message_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null default current_date,
  message_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

-- Index for efficient lookups by user and date
create index idx_daily_message_usage_user_date on daily_message_usage(user_id, date);

-- RLS
alter table daily_message_usage enable row level security;

-- Users can only see their own usage
create policy "Users can view own usage" on daily_message_usage
  for select using (auth.uid() = user_id);

-- Users can insert their own usage records
create policy "Users can insert own usage" on daily_message_usage
  for insert with check (auth.uid() = user_id);

-- Users can update their own usage records
create policy "Users can update own usage" on daily_message_usage
  for update using (auth.uid() = user_id);

-- Function to increment daily message count (atomic operation)
create or replace function increment_daily_message_count(p_user_id uuid)
returns table(new_count integer, daily_limit integer, is_limited boolean)
language plpgsql
security definer
as $$
declare
  v_daily_limit constant integer := 15;
  v_current_count integer;
begin
  -- Insert or update the daily count atomically
  insert into daily_message_usage (user_id, date, message_count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, date)
  do update set
    message_count = daily_message_usage.message_count + 1,
    updated_at = now()
  returning daily_message_usage.message_count into v_current_count;

  return query select
    v_current_count as new_count,
    v_daily_limit as daily_limit,
    (v_current_count > v_daily_limit) as is_limited;
end;
$$;

-- Function to check current usage without incrementing
create or replace function get_daily_message_usage(p_user_id uuid)
returns table(message_count integer, daily_limit integer, remaining integer)
language plpgsql
security definer
as $$
declare
  v_daily_limit constant integer := 15;
  v_current_count integer;
begin
  select coalesce(dmu.message_count, 0)
  into v_current_count
  from daily_message_usage dmu
  where dmu.user_id = p_user_id and dmu.date = current_date;

  if v_current_count is null then
    v_current_count := 0;
  end if;

  return query select
    v_current_count as message_count,
    v_daily_limit as daily_limit,
    greatest(0, v_daily_limit - v_current_count) as remaining;
end;
$$;
