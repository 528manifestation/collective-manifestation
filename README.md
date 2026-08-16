# Collective Manifestation

Local workspace for rebuilding `collectivemanifestation.org`.

## Source context

- Project brief: `docs/cmprompt-source.md`
- Source asset inventory: `docs/source-assets-inventory.md`
- Time-zone image outsourcing prompts: `docs/timezone-image-prompts.md`
- Informational time-zone card prompts: `docs/timezone-informational-card-prompts.md`
- Hosting/Supabase architecture: `docs/hosting-and-supabase-architecture.md`
- Bootstrap plan: `.hermes/plans/2026-08-15_145044-collective-manifestation-bootstrap.md`
- Original note location: `C:\Users\Rick\.hermes\CollectiveManifestation\cmprompt.md`
- GitHub repository: `https://github.com/528manifestation/collective-manifestation`

## Current status

WORKING/IDLE: project workspace created; source resources inventoried; GitHub remote configured and initial docs pushed; hosting direction selected as Vercel + Supabase; ManifestWave spreadsheet/card draft pipeline generated; Vite + React + TypeScript + Supabase client skeleton built locally; full cleaned ManifestWave JSON data and music preview assets are wired locally; no Vercel deploy and no DNS changes made.

## Architecture direction

- Host/deploy on **Vercel**.
- Use **Supabase** for database/backend needs.
- Rick has a paid/premium Supabase plan, so Supabase is acceptable for the production path.
- Replit is historical only and should not be used for the rebuild.
- Default app recommendation: Vite + React + TypeScript with Supabase client integration.

## Source resources

Rick confirmed all current resources should remain in the original source folder and be copied/moved into this project only as needed:

- `C:\Users\Rick\.hermes\CollectiveManifestation`

Verified current resources include music MP3s, old-site HTML/CSS reference files, flag SVGs, country map-outline JPGs, and old site/logo imagery.

## ManifestWave card pipeline

Generated planning/build artifacts:

- Spreadsheet workbook: `docs/manifestwave-timezone-chart.xlsx`
- Clean card lists: `docs/manifestwave-timezone-card-lists.md`
- Asset manifest: `docs/manifestwave-asset-manifest.csv`
- Card prompt pack: `docs/timezone-card-prompts/`
- Draft card PNGs: `public/assets/manifestwave/timezone-cards/`
- Copied flag assets: `public/assets/manifestwave/flags/`
- Copied map-outline assets: `public/assets/manifestwave/maps/`
- Regeneration scripts: `scripts/generate_manifestwave_timezone_chart.py`, `scripts/prepare_manifestwave_cards.py`

Draft card QA status: flags are complete, but some map outlines are missing and some copied map outlines contain embedded text/labels that must be cleaned before final production use. Original source assets remain untouched.

## App skeleton

The local web app skeleton uses Vite + React + TypeScript with a Supabase browser client placeholder.

Key files:

- `package.json` — app scripts and dependencies
- `src/App.tsx` — one-page site skeleton
- `src/lib/manifestwave.ts` — ManifestWave helper/data layer for the first UI pass
- `src/data/manifestwave-zones.json` — full cleaned 24-zone country/region dataset generated from the spreadsheet
- `src/data/songs.json` — local music track metadata
- `src/lib/music.ts` — music data helper layer
- `src/lib/supabase.ts` — Supabase client initialization from Vite environment variables
- `supabase/migrations/0001_initial_schema.sql` — draft schema for songs, contact, waitlist, zones, and countries
- `.env.example` — expected Supabase env var names without secrets

Current commands:

```bash
npm test
npm run build
npm run dev -- --port 5173
```

The current UI pass wires in the 24 generated card PNGs, the full cleaned ManifestWave JSON dataset, and 9 local MP3 preview tracks. The production data model should later be replaced with Supabase-backed `manifestwave_zones`, `manifestwave_countries`, and `songs` records.

## High-level scope

- Public landing page for Collective Manifestation / ManifestWave.
- Welcome video placeholder.
- Live time-zone wave tracker for the 5:28 call.
- Informational time-zone cards showing each zone's countries/regions with country/region names and flags.
- Setting-of-Intentions video placeholder.
- Original music library with lyrics/artwork/downloads.
- Community, blog/about/FAQ, contact, and donation/support sections.
- Supabase-backed music metadata, contact messages, and optional member/waitlist records.

## Guardrails

- GitHub remote is linked locally; do not commit or push until Rick explicitly approves.
- Do not change Squarespace DNS without Rick's explicit approval.
- Do not deploy publicly without Rick's explicit approval.
- Do not post/publish promotional content without Rick's explicit approval.
- Prefer a simple Vercel + Supabase architecture; do not add a custom server unless a real need appears.
