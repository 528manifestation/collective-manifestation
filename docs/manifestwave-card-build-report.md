# ManifestWave Card Build Report

Generated draft informational cards and supporting data.

## Outputs

- Clean slot summary: `docs/manifestwave-timezone-slot-summary-clean.csv`
- Clean country chart: `docs/manifestwave-timezone-country-chart-clean.csv`
- Clean readable card lists: `docs/manifestwave-timezone-card-lists.md`
- Asset manifest: `docs/manifestwave-asset-manifest.csv`
- Draft card HTML: `build-assets/timezone-card-html/`
- Draft card PNGs: `public/assets/manifestwave/timezone-cards/`
- Copied flags: `public/assets/manifestwave/flags/`
- Copied map outlines: `public/assets/manifestwave/maps/`

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

1. Open `docs/manifestwave-asset-manifest.csv` and review missing maps/flags.
2. Inspect copied map outlines for embedded text/labels.
3. Replace or clean copied map files in `public/assets/manifestwave/maps/` as needed.
4. Regenerate cards after cleanup.
5. Verify dense cards like `utc-plus-01.png`, `utc-plus-02.png`, and `utc-minus-04.png` for readability.

Original assets were not modified.
