-- Collective Manifestation initial Supabase schema
-- Safe to review in SQL editor before applying. Do not run against production until approved.

create extension if not exists pgcrypto;

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  track_number integer,
  audio_path text,
  artwork_path text,
  lyrics text,
  description text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  subject text,
  message text not null,
  source text not null default 'website',
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist_members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  intention text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create table if not exists public.manifestwave_zones (
  id uuid primary key default gen_random_uuid(),
  slot integer not null unique check (slot between -11 and 12),
  label text not null,
  card_filename text not null,
  wave_window text not null default '5:00 PM – 5:59 PM local wave window',
  manifest_call_time text not null default '5:28 PM',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manifestwave_countries (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references public.manifestwave_zones(id) on delete cascade,
  name text not null,
  iso_alpha2 text not null,
  detail text,
  flag_path text,
  is_multi_slot boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(zone_id, iso_alpha2, name)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger songs_set_updated_at
before update on public.songs
for each row execute function public.set_updated_at();

create trigger manifestwave_zones_set_updated_at
before update on public.manifestwave_zones
for each row execute function public.set_updated_at();

create trigger manifestwave_countries_set_updated_at
before update on public.manifestwave_countries
for each row execute function public.set_updated_at();

alter table public.songs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.waitlist_members enable row level security;
alter table public.manifestwave_zones enable row level security;
alter table public.manifestwave_countries enable row level security;

create policy "Published songs are public"
on public.songs for select
using (is_published = true);

create policy "ManifestWave zones are public"
on public.manifestwave_zones for select
using (true);

create policy "ManifestWave countries are public"
on public.manifestwave_countries for select
using (true);

create policy "Anyone can submit contact messages"
on public.contact_messages for insert
with check (true);

create policy "Anyone can join waitlist"
on public.waitlist_members for insert
with check (true);
