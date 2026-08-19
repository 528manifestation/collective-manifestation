-- Store member signup country in profiles for future ManifestWave analytics.
-- Apply manually in Supabase SQL Editor before deploying this signup change live.

alter table public.profiles
add column if not exists country text;

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  requested_username text;
  requested_country text;
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
  requested_country := nullif(left(trim(regexp_replace(coalesce(new.raw_user_meta_data ->> 'country', ''), '\s+', ' ', 'g')), 80), '');

  insert into public.profiles (id, username, display_name, country, role)
  values (new.id, requested_username, requested_username, requested_country, 'member')
  on conflict (id) do update
  set country = coalesce(public.profiles.country, excluded.country);

  return new;
end;
$$;

update public.profiles as profile
set country = nullif(left(trim(regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'country', ''), '\s+', ' ', 'g')), 80), '')
from auth.users as auth_user
where profile.id = auth_user.id
  and nullif(coalesce(profile.country, ''), '') is null
  and nullif(coalesce(auth_user.raw_user_meta_data ->> 'country', ''), '') is not null;

notify pgrst, 'reload schema';
