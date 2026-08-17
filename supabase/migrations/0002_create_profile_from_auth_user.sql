-- Create member profiles from Supabase Auth users server-side.
-- This avoids browser-side inserts into public.profiles being blocked by RLS.

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_username text;
begin
  requested_username := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, ''), '@', 1), 'member'),
      '[^a-z0-9_]',
      '_',
      'g'
    )
  );

  requested_username := trim(both '_' from regexp_replace(requested_username, '_+', '_', 'g'));

  if length(requested_username) < 3 then
    requested_username := 'member_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  requested_username := left(requested_username, 24);

  insert into public.profiles (id, username, display_name, role)
  values (new.id, requested_username, requested_username, 'member')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_after_auth_user_insert on auth.users;
create trigger create_profile_after_auth_user_insert
after insert on auth.users
for each row execute function public.create_profile_for_new_auth_user();

insert into public.profiles (id, username, display_name, role)
select
  auth_user.id,
  left(
    trim(both '_' from regexp_replace(
      lower(regexp_replace(
        coalesce(auth_user.raw_user_meta_data ->> 'username', split_part(coalesce(auth_user.email, ''), '@', 1), 'member'),
        '[^a-z0-9_]',
        '_',
        'g'
      )),
      '_+',
      '_',
      'g'
    )),
    24
  ) as username,
  left(
    trim(both '_' from regexp_replace(
      lower(regexp_replace(
        coalesce(auth_user.raw_user_meta_data ->> 'username', split_part(coalesce(auth_user.email, ''), '@', 1), 'member'),
        '[^a-z0-9_]',
        '_',
        'g'
      )),
      '_+',
      '_',
      'g'
    )),
    24
  ) as display_name,
  'member'
from auth.users as auth_user
where not exists (
  select 1 from public.profiles where profiles.id = auth_user.id
)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
