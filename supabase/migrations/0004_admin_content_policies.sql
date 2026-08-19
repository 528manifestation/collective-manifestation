-- Admin content-management policies for Collective Manifestation.
-- Apply manually in Supabase SQL Editor after confirming admin_rick has role = 'admin'.

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.current_user_is_admin() from public;
grant execute on function public.current_user_is_admin() to authenticated;

alter table public.songs enable row level security;
alter table public.blog_posts enable row level security;

alter table public.songs
add column if not exists is_theme_song boolean not null default false;

drop policy if exists "Admins can manage songs" on public.songs;
create policy "Admins can manage songs"
on public.songs for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "Admins can manage blog posts" on public.blog_posts;
create policy "Admins can manage blog posts"
on public.blog_posts for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create table if not exists public.site_content (
  key text primary key check (key ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  label text not null check (char_length(label) between 3 and 120),
  value text not null,
  section text not null default 'general' check (section ~ '^[a-z0-9]+(?:[._-][a-z0-9]+)*$'),
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Published site content is public" on public.site_content;
create policy "Published site content is public"
on public.site_content for select
using (is_published = true);

drop policy if exists "Admins can manage site content" on public.site_content;
create policy "Admins can manage site content"
on public.site_content for all
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

notify pgrst, 'reload schema';
