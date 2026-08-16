# ManifestWave Card Build Report

Generated draft informational cards and supporting data. Current card design renders country/region names, flags, and smaller state/region detail text where needed. Map-outline assets are retained as optional reference assets but are not displayed on the draft card PNGs because the cleaner direction is country name + flag only.

## Outputs

- Clean slot summary: `docs/manifestwave-timezone-slot-summary-clean.csv`
- Clean country chart: `docs/manifestwave-timezone-country-chart-clean.csv`
- Clean readable card lists: `docs/manifestwave-timezone-card-lists.md`
- Asset manifest: `docs/manifestwave-asset-manifest.csv`
- Draft card HTML: `build-assets/timezone-card-html/`
- Draft card PNGs: `public/assets/manifestwave/timezone-cards/`
- Copied flags: `public/assets/manifestwave/flags/`
- Copied map outlines/reference assets: `public/assets/manifestwave/maps/`

## Counts

- Unique country/region slot rows: 302
- Unique country/region assets in manifest: 247
- Flags copied: 247
- Flags missing: 0
- Map outlines copied: 183
- Map outlines missing: 64
- Draft PNG cards generated: 24

## Important QA status

These are **draft** cards. Before final website use:

1. Review whether the cleaner no-map-outline card style is preferred.
2. Verify United States entries show the intended smaller state/region detail text.
3. Verify dense cards like `utc-plus-01.png`, `utc-plus-02.png`, and `utc-minus-04.png` for readability.
4. If map outlines are reused later, inspect copied map outlines for embedded text/labels first.

Original assets were not modified.
