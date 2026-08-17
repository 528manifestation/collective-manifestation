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
- `profiles` — member usernames/profile metadata tied to `auth.users`; passwords stay in Supabase Auth, never in app tables.
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

Authenticated member access:

- members can read/create/update their own profile row
- usernames are validated as 3–24 lowercase letters, numbers, or underscores
- passwords are handled only by Supabase Auth (`auth.users`) and are not stored in public tables

No public update/delete policies are included.

## Before applying

1. Create or select the Supabase project.
2. Review the migration SQL.
3. Decide whether audio lives in Git/Vercel public assets or Supabase Storage.
4. Confirm Supabase Auth settings for email/password signup, password reset, and whether email confirmation is required.
5. Add real Vite env vars only in local `.env` and Vercel project settings, never in Git.
