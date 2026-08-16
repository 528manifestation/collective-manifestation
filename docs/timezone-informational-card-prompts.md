# ManifestWave Informational Time-Zone Card Prompts

Purpose: revised prompt direction after Rick reviewed the first generated artwork and clarified that the website time-zone images should be **informational**, with the countries for each time-zone group shown together in one PNG/card.

## Design Decision

Use informational infographic-style cards rather than purely cinematic/global artwork.

Each time-zone card should show:

- UTC zone label
- Local wave window: `5:00 PM – 5:59 PM`
- Manifest call time: `5:28 PM`
- All countries/regions assigned to that zone group
- Each country as a compact tile with:
  - country name
  - flag
  - smaller secondary detail text when needed, especially for countries split across multiple time zones

Updated card direction after review: do **not** render the country map-outline assets directly on the main card PNGs. Rick prefers the cleaner card direction with the country/region name and flag only, plus smaller state/region detail text where needed. Keep map assets optional/reference only for future detail views or alternate layouts.

United States rule: the United States must appear in the applicable UTC cards and should include smaller writing listing the relevant states/regions for that slot.

## Important Web Recommendation

For the production website, do **not** rely on the PNG as the only source of country text.

Best structure:

1. Use the PNG/card as a visual aid.
2. Also render the countries as real HTML text from a data file.
3. This keeps the site accessible, searchable, mobile-readable, and easy to correct.

Reason: text baked into images can become blurry on mobile, cannot be searched, cannot be translated, and is hard to update if a country/time-zone assignment changes.

## Spelling / QA Rule

Every generated image must be checked for spelling before use.

Example correction from the first test image:

- Wrong: `Afganistan`
- Correct: `Afghanistan`

## Map-Outline Cleanup Rule

Some of Rick's generic map-outline source images include embedded text, labels, or markings. Since the current main card design no longer renders the outlines, this is now a lower-priority cleanup task. If maps are reused later in detail views or alternate card layouts, those embedded labels should **not** appear.

Before a map outline is used in a final time-zone card:

1. Work from a copied asset, not the original file.
2. Remove/erase any embedded labels, country names, watermarks, grid text, or other text artifacts.
3. Keep only the clean country/region outline.
4. Save the cleaned copy under a web-safe filename, for example `public/assets/manifestwave/maps/afghanistan.jpg`.
5. QA the final card at mobile and desktop sizes to confirm no leftover text is visible.

Prompt instruction to include when outsourcing or generating cards:

```text
Use only cleaned map-outline assets with no embedded labels or text. If a provided map outline contains text, remove the text while preserving the outline shape. The final card should show only the country/region name in the designed text label, not inside the map image.
```

## Visual Style Direction

Use a clean educational infographic style, not a fantasy landscape.

Recommended style:

- White or very light background for readability
- Purple/magenta headings to match the sample direction
- Country tiles in a consistent grid
- Flag as the primary country visual
- Small secondary text for states/regions where useful
- No country map outlines in the main card PNGs
- Clear readable sans-serif typography
- Plenty of spacing
- No cluttered backgrounds
- No decorative elements that reduce readability

## Global Prompt Template

Use this template for each time-zone card:

```text
Create a clean informational website infographic card for Collective Manifestation's ManifestWave tracker.

Format: one wide PNG, 16:9 aspect ratio, 1920x1080.
Background: white or very light warm gray.
Style: modern educational geography card, clean web UI, accessible, readable, minimal, polished.
Color palette: white background, dark charcoal text, purple/magenta section headings, subtle gold accent line for the ManifestWave theme.

Top header: "UTC [ZONE] ManifestWave Zone"
Subheader: "Wave window: 5:00 PM – 5:59 PM local time | Manifest call: 5:28 PM"

Main content: show all countries/regions in this UTC zone group as a neat grid of country tiles.
Each country tile must include:
1. Correctly spelled country/region name
2. Accurate national flag
3. Clean simple black or dark-gray map outline silhouette with no embedded text or labels

Countries/regions to include:
[COUNTRY LIST]

Layout requirements:
- Fit all listed countries in one image without crowding.
- Use a consistent tile size.
- Keep flags proportional and undistorted.
- Keep map outlines simple, high contrast, and easy to recognize.
- Remove any embedded text/labels from source map outlines before final use.
- Do not invent countries.
- Do not misspell country names.
- Do not add extra text beyond the specified title/subtitle/country names.
- No watermark, no logo, no decorative fantasy background.
- Leave a small safe margin around all edges.
```

## Single-Country Example Prompt — Afghanistan

Use this as a corrected version of the first test image style:

```text
Create a clean informational website geography card for Collective Manifestation's ManifestWave tracker.

Format: wide PNG, 16:9 aspect ratio, 1200x675 or 1920x1080.
Background: white.
Style: minimal educational web infographic, clean and readable.

Show the country Afghanistan.
Use the correct spelling: "Afghanistan".
Place the country name in a purple/magenta heading at the upper left.
Below the heading, place the accurate Afghanistan flag, rectangular and undistorted.
On the right side, place a simple black or dark-gray outline map silhouette of Afghanistan.
Use generous spacing, crisp edges, and no extra decoration.
No watermark, no logo, no fake text.
```

## Prompt for a Full UTC Zone Card

When producing one PNG for an entire zone, use this pattern:

```text
Create a clean informational website infographic card for Collective Manifestation's ManifestWave tracker.

Format: 1920x1080 PNG, 16:9.
Background: white.
Style: modern educational geography infographic, simple, readable, web-friendly.

Header text: "UTC [ZONE] ManifestWave Zone"
Subheader text: "5:00 PM – 5:59 PM local wave window | 5:28 PM Manifest Call"

Create a grid of country tiles. Each tile contains the country name, its flag, and a simple map outline silhouette. Use consistent spacing and high readability.

Countries/regions in this zone:
[PASTE COMPLETE COUNTRY LIST HERE]

Do not misspell names. Do not distort flags. Do not invent map shapes. No watermark. No logo. No fantasy background. Keep the image clean, informational, and suitable for a public website.
```

## Open Accuracy Issue

The original concept says 24 zones, but real-world civil time zones include half-hour and quarter-hour offsets such as Afghanistan at UTC+4:30.

Before generating all final cards, decide one of these approaches:

### Option A — 24 symbolic hourly groups

Keep the project concept simple: 24 hourly ManifestWave groups. Countries with half-hour/quarter-hour offsets are assigned to the nearest or most appropriate UTC-hour group for display.

Pros: matches the 24-hour ManifestWave concept.
Cons: not technically exact for every country.

### Option B — real civil time zones

Support actual offsets including half-hour and quarter-hour zones.

Pros: technically accurate.
Cons: creates more than 24 cards and complicates the original 24-zone story.

### Recommendation

Use **Option A** for the public ManifestWave story, but include a small website note later: some countries use half-hour or quarter-hour civil offsets and are grouped for the symbolic 24-wave display.
