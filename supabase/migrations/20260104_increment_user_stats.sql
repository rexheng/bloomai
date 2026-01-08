-- Remote function to safely increment user stats (XP, Messages) and recalculate Level
create or replace function increment_user_stats(
  user_id uuid,
  xp_delta int,
  messages_delta int
)
returns json
language plpgsql
security definer
as $$
declare
  current_xp int;
  current_messages int;
  new_xp int;
  new_messages int;
  new_level int;
  current_level int;
begin
  -- Lock the row for update to prevent race conditions
  select xp, messages_sent, level
  into current_xp, current_messages, current_level
  from profiles
  where id = user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  -- Calculate new values
  new_xp := coalesce(current_xp, 0) + xp_delta;
  new_messages := coalesce(current_messages, 0) + messages_delta;
  
  -- Level calculation: Level 1 starts at 0 XP. 
  -- Simple formula: Level = floor(XP / 100) + 1
  -- You can adjust this formula as needed.
  new_level := floor(new_xp / 100) + 1;

  -- Update the profile
  update profiles
  set 
    xp = new_xp,
    messages_sent = new_messages,
    level = new_level,
    updated_at = now()
  where id = user_id;

  -- Return the new stats
  return json_build_object(
    'xp', new_xp,
    'messages_sent', new_messages,
    'level', new_level,
    'level_up', (new_level > coalesce(current_level, 1))
  );
end;
$$;
