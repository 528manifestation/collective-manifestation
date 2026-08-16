# Supabase Schema Plan

Status: drafted only. Not applied to a remote Supabase project yet.

Migration file:

```text
supabase/migrations/0001_initial_schema.sql
```

## Tables

- `songs` — music metadata, lyrics, artwork/audio paths, publish flag.
- `contact_messages` — website contact form submissions.
- `waitlist_members` — signup/waitlist records.
- `manifestwave_zones` — the 24 symbolic UTC slots.
- `manifestwave_countries` — countries/regions assigned to each symbolic slot.

## Security posture

Row Level Security is enabled on all tables.

Public reads:

- published songs only
- ManifestWave zones
- ManifestWave countries

Public inserts:

- contact messages
- waitlist members

No public update/delete policies are included.

## Before applying

1. Create or select the Supabase project.
2. Review the migration SQL.
3. Decide whether audio lives in Git/Vercel public assets or Supabase Storage.
4. Add real Vite env vars only in local `.env` and Vercel project settings, never in Git.
