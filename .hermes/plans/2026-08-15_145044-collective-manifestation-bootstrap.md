# Collective Manifestation Bootstrap Plan

> **For Hermes:** This is planning-only context. Do not deploy, change DNS, publish, or post publicly without Rick's explicit approval.

**Goal:** Rebuild CollectiveManifestation.org as a cleaner, locally managed project with a practical launch path: music library, ManifestWave time-zone tracker, video placeholders, membership/community paths, donation/support section, and future hosting/DNS migration.

**Architecture:** Start with a small web app/static-first site and only add backend services where they are actually needed. Treat the old Replit site as reference material, not necessarily as code to preserve. Keep DNS/hosting migration as a separate approval-gated phase after local build and preview validation.

**Tech Stack:** To be selected after source inventory. Default recommendation is Vite/React or Next.js on Vercel/Netlify with static assets first; add Supabase/Firebase/Neon only if member accounts, upload management, or dynamic content become necessary.

---

## Current Context

Source brief copied from:

- `C:\Users\Rick\.hermes\CollectiveManifestation\cmprompt.md`

Local project workspace:

- `C:\Users\Rick\.openclaw\workspace\Projects\collective-manifestation`

Existing local reference assets found:

- `C:\Users\Rick\.hermes\CollectiveManifestation\flag-icons-main\...`

Known live/domain context from the brief:

- Existing site: `collectivemanifestation.org`
- Existing host: Replit
- Domain/DNS: Squarespace
- Possible separate GitHub account: `manifestwave538@gmail.com`

## Product Requirements Captured

### Core public site

- Hero section with Collective Manifestation title, tagline, and welcome video placeholder.
- Updated hero copy based on the current project message.
- Clear CTA: join community / become a member.
- ManifestWave explanation section.
- Donation/support section.
- Community/forum entry point.
- Blog/manifest content area.
- FAQ/about section.
- Contact form or contact path.

### ManifestWave tracker

- Show current UTC time.
- Determine which UTC offset/time-zone group is currently in the `5:00 PM - 5:59 PM` window.
- Display countries in that current wave group.
- Show country name, flag, and optionally map outline.
- At minute `28` through `38` of each hour, flash a call-to-action: `Please start the Intention for Manifestation video now!`
- Include placeholder for the `Setting of Intentions` video under the tracker.

### Music library

- Highlight official theme song: `Collective Manifestation Theme Song`.
- Display/download original music tracks.
- Track metadata should include title, artist/project, lyrics, artwork, audio file/download link, and featured flag.
- Start static if possible; only add database/storage once content management or membership controls require it.

### Media assets

- Welcome video placeholder in hero.
- Setting-of-Intentions video placeholder near tracker.
- Music audio files.
- Lyrics files.
- Artwork/cover images.
- Country flags and possibly map outlines.

### Operations / migration

- Create isolated local project directory.
- Decide whether to recover files from Replit/GitHub or rebuild from scratch.
- Set up new hosting.
- Change Squarespace DNS only after preview is validated and Rick approves.

---

## Recommended Approach

1. **Inventory first, rebuild second.** The old site may contain useful copy/assets, but likely not enough architecture to preserve wholesale.
2. **Build static-first.** The public site, tracker, and music metadata can likely be shipped without a database initially.
3. **Avoid premature backend.** A DB is only justified if members log in, user-generated content is stored, content is edited outside code, or downloads are gated.
4. **Use reliable public hosting.** Vercel/Netlify/Cloudflare Pages are better fits than Replit for a public site.
5. **Separate launch gates.** Local build → preview deploy → content review → DNS cutover. DNS changes are approval-gated.

---

## Step-by-Step Plan

### Phase 1: Project setup and source inventory

**Objective:** Establish the local project workspace and decide whether to import old source or rebuild cleanly.

**Files:**
- Existing: `docs/cmprompt-source.md`
- Create later if useful: `docs/source-inventory.md`
- Create later if useful: `docs/product-requirements.md`

**Steps:**
1. Confirm local project directory exists: `C:\Users\Rick\.openclaw\workspace\Projects\collective-manifestation`.
2. Inventory local reference files under `C:\Users\Rick\.hermes\CollectiveManifestation`.
3. If Rick provides GitHub/Replit access, inspect the old source read-only.
4. Decide: import old source or rebuild from scratch.
5. Record decision in `docs/source-inventory.md`.

**Validation:**
- Local workspace exists.
- Source brief is copied into `docs/cmprompt-source.md`.
- Old assets/source availability is documented.

### Phase 2: Choose stack and create skeleton

**Objective:** Create the simplest maintainable web app foundation.

**Likely options:**
- Vite + React + static JSON: simplest for this project.
- Next.js: better if server-side/API routes/member features are needed soon.
- Astro: strong for content-heavy static pages.

**Recommendation:** Start with Vite/React unless membership/login or server routes become immediate requirements.

**Files likely to be created:**
- `package.json`
- `index.html`
- `src/App.tsx` or equivalent
- `src/styles.css`
- `src/data/music.ts` or `src/data/music.json`
- `src/data/timezones.ts` or `src/data/wave-zones.json`
- `public/assets/...`

**Validation:**
- Local dev server runs.
- Production build succeeds.
- Site loads locally.

### Phase 3: Implement public landing page

**Objective:** Rebuild the current layout cleanly with placeholders for missing media.

**Sections:**
1. Hero / welcome video placeholder.
2. Mission copy.
3. ManifestWave explanation.
4. Live tracker placeholder/component.
5. Donation/support cards.
6. Guided video section.
7. Music library preview.
8. Community/forum CTA.
9. Blog/about/FAQ.
10. Contact footer.

**Validation:**
- All required sections visible on desktop and mobile.
- CTAs are clear.
- Missing media uses intentional placeholders, not broken links.

### Phase 4: Implement ManifestWave tracker

**Objective:** Build the live `5:28 somewhere` mechanic.

**Core logic:**
1. Read current UTC time.
2. For each UTC offset group, compute local hour/minute.
3. Select group(s) where local hour is `17`.
4. Highlight active group from `17:00` to `17:59` local.
5. Flash `Manifest Now` from minute `28` through `38` of every hour for the group currently at 5 PM.

**Data model:**
- Offset label, e.g. `UTC+6`.
- Countries/regions in that offset group.
- Country code for flag.
- Optional map outline asset.

**Validation:**
- Manual time simulation can verify UTC offsets.
- At minutes 28-38, alert is visible/flashing.
- Outside minutes 28-38, alert is hidden or calm.

### Phase 5: Build music library

**Objective:** Display and eventually download original tracks with artwork and lyrics.

**Initial static model:**
- `title`
- `artist`
- `description`
- `featured`
- `audioUrl`
- `artworkUrl`
- `lyricsUrl` or inline lyrics path

**Validation:**
- Theme song is highlighted.
- Track list renders from data.
- Download/play buttons only show when an asset exists.
- Missing assets display clean placeholders.

### Phase 6: Hosting preview

**Objective:** Deploy a private/preview build without touching DNS.

**Candidate hosts:**
- Vercel
- Netlify
- Cloudflare Pages

**Validation:**
- Preview URL works.
- Mobile/desktop reviewed.
- No DNS changes yet.

### Phase 7: DNS migration

**Objective:** Move `collectivemanifestation.org` to the new host after Rick approves.

**Approval required before this phase.**

**Likely steps:**
1. Confirm selected host DNS instructions.
2. Open Squarespace DNS settings.
3. Update A/CNAME records exactly as required by host.
4. Wait for propagation.
5. Verify apex and `www` domain.
6. Keep rollback notes.

**Validation:**
- `https://collectivemanifestation.org` resolves to new host.
- `https://www.collectivemanifestation.org` resolves correctly.
- SSL is valid.
- Old Replit path is no longer primary.

---

## Risks / Tradeoffs

- **Country-to-time-zone mapping is not clean.** Some countries span multiple time zones or observe daylight saving. For launch, use UTC offset groups as a symbolic wave model; document multi-zone countries as `parts` where needed.
- **Map outlines can become asset-heavy.** Start with flags and text; add map outlines later if visual quality justifies it.
- **Database may be unnecessary at first.** Static music metadata plus hosted audio files may be enough for launch. Add DB/storage only when uploads, accounts, permissions, or content editing require it.
- **DNS cutover can break the live site.** Treat DNS changes as a separate approved operation with rollback notes.
- **Claims around 528 Hz/healing should be worded carefully.** Use inspirational/spiritual language without making medical/scientific guarantees.

---

## Open Questions for Rick

1. Do we want to rebuild from scratch, or should I inspect/import the existing GitHub/Replit source first?
2. Which host do you prefer for the new site: Vercel, Netlify, Cloudflare Pages, or no preference?
3. Should the first version require member login, or should downloads/content be public at launch?
4. Do you already have the music audio files, lyrics, artwork, welcome video, and intention video available locally?
5. Is the separate GitHub account already accessible on this machine, or do we need to set up auth later?
6. Should community/forum be a real in-site feature, or a link to Discord/Facebook/other external community for v1?

---

## Stop Point

The safe next action is source inventory: inspect the existing local `flag-icons-main` assets and, if Rick wants, recover/read the old GitHub/Replit project before generating the app skeleton.

No hosting, DNS, deploy, public posting, or external account changes should happen without explicit approval.
