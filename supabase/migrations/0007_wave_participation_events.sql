-- ManifestWave participation analytics events.
-- Apply manually in Supabase SQL Editor before pushing the UI live.

create table if not exists public.wave_participation_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users(id) on delete cascade,
  country text not null default '',
  browser_timezone text not null default '',
  utc_offset_minutes_at_event integer not null check (utc_offset_minutes_at_event between -840 and 840),
  active_manifestwave_slot integer not null check (active_manifestwave_slot between -11 and 12),
  ritual_action_type text not null check (ritual_action_type in ('started_ritual', 'completed_ritual')),
  client_reported_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists wave_participation_events_created_at_idx
on public.wave_participation_events (created_at desc);

create index if not exists wave_participation_events_slot_created_at_idx
on public.wave_participation_events (active_manifestwave_slot, created_at desc);

create index if not exists wave_participation_events_member_created_at_idx
on public.wave_participation_events (member_id, created_at desc);

alter table public.wave_participation_events enable row level security;

drop policy if exists "Members can record their own wave participation" on public.wave_participation_events;
create policy "Members can record their own wave participation"
on public.wave_participation_events for insert
to authenticated
with check (auth.uid() = member_id);

drop policy if exists "Members can read their own wave participation" on public.wave_participation_events;
create policy "Members can read their own wave participation"
on public.wave_participation_events for select
to authenticated
using (auth.uid() = member_id);

drop policy if exists "Admins can read all wave participation" on public.wave_participation_events;
create policy "Admins can read all wave participation"
on public.wave_participation_events for select
to authenticated
using (public.current_user_is_admin());

notify pgrst, 'reload schema';
