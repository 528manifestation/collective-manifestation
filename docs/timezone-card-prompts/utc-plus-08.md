# UTC+8 ManifestWave Card Prompt

Target output file:

```text
utc-plus-08.png
```

Country/region count: **13**
Manual-review rows in source chart: **9**

## Prompt

```text
Create a clean informational website infographic card for Collective Manifestation's ManifestWave tracker.

This is NOT fantasy art. This is an educational time-zone country card.

Use the provided flag files and cleaned map-outline files as the source assets. Do not invent flags. Do not invent or redraw map outlines. If a provided map outline contains embedded text, labels, watermarks, or grid markings, remove that text while preserving the clean outline shape.

Format: 3840x2160 PNG master file, 16:9. It must also remain readable when exported down to 1920x1080.
Background: white or very light warm gray.
Style: clean modern web infographic, accessible, readable, polished.
Color palette: white/light background, dark charcoal text, purple/magenta headings, subtle gold ManifestWave accent line.

Header text:
"UTC+8 ManifestWave Zone"

Subheader text:
"5:00 PM – 5:59 PM local wave window | 5:28 PM Manifest Call"

Main content:
Create a readable grid of country/region tiles. Each tile contains:
1. Correctly spelled country/region name
2. Accurate provided flag, proportional and undistorted
3. Clean provided map-outline silhouette with no embedded labels or text

Countries/regions to include exactly:
Antarctica (parts); Australia (parts); Brunei; China (parts); Hong Kong; Indonesia (parts); Macao; Malaysia; Mongolia (parts); Philippines; Russia (parts); Singapore; Taiwan, Province of China

Layout requirements:
- Fit all listed countries/regions in one image without crowding.
- Use consistent tile sizes and spacing.
- Keep text large and crisp.
- Keep flags proportional and undistorted.
- Keep map outlines simple, high contrast, and easy to recognize.
- Do not add extra countries/regions.
- Do not remove any listed countries/regions.
- Do not misspell country/region names.
- Do not add extra text beyond the specified title, subtitle, and country/region names.
- No watermark. No logo. No fantasy landscape background.
- Leave safe margins around all edges.
```

## QA Checklist

- [ ] Output filename is `utc-plus-08.png`.
- [ ] Header says `UTC+8 ManifestWave Zone`.
- [ ] All listed countries/regions are present exactly once unless marked `(parts)`.
- [ ] Spelling checked manually.
- [ ] Flags are correct and undistorted.
- [ ] Map outlines have no embedded text/labels.
- [ ] Card is readable at 1920x1080 and on mobile preview.
- [ ] Website will also render the country list as real HTML text, not only inside this PNG.
