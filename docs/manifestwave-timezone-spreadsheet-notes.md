# ManifestWave Time-Zone Spreadsheet Notes

Generated for the Collective Manifestation project.

## Files created

- `docs/manifestwave-timezone-chart.xlsx` — Excel workbook with two tabs: `Slot Summary` and `Country Detail`.
- `docs/manifestwave-timezone-slot-summary.csv` — prompt-ready row per ManifestWave card/slot.
- `docs/manifestwave-timezone-country-chart.csv` — detailed row per country/time-zone reference.

## Data sources

- IANA tzdb `zone1970.tab`: `https://data.iana.org/time-zones/tzdb/zone1970.tab`
- ISO-3166 country names: `https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv`
- Local flags: `C:\Users\Rick\.hermes\CollectiveManifestation\flag-icons-main\flags\4x3`
- Local map outlines: `C:\Users\Rick\.hermes\CollectiveManifestation\MapOutlines`

## Assignment model

Rick selected **Option A: 24 symbolic hourly ManifestWave groups**.

The spreadsheet uses 24 display cards from `UTC-11` through `UTC+12`. Real civil offsets that fall outside that range wrap around the 24-hour cycle, for example `UTC+13` maps to the `UTC-11` card and `UTC+14` maps to the `UTC-10` card.

Fractional offsets are assigned to the nearest symbolic hourly slot and flagged for manual review. Example: Afghanistan has an actual offset of `UTC+04:30`, so it is assigned to the symbolic `UTC+5` card.

Reference date used for offset calculation: `2026-01-15`. Some countries observe daylight saving time, so countries marked `multi_slot_country = yes` or `needs_manual_review = yes` should be reviewed before final card generation.

## How to use

1. Open `manifestwave-timezone-chart.xlsx` in Excel.
2. Start with the `Slot Summary` tab.
3. For each row, use `countries_regions_for_prompt` as the country list for that UTC card.
4. Use the `Country Detail` tab to match each country to a flag file and map-outline file.
5. Correct missing map matches, embedded text in map outlines, or fractional-offset decisions before generating final PNGs.

## Asset renaming recommendation

Do not rename Rick's original files. Copy only the selected assets into the web project using clean names, for example:

- `public/assets/manifestwave/flags/afghanistan.svg`
- `public/assets/manifestwave/maps/afghanistan.jpg`
- `public/assets/manifestwave/cards/utc-plus-05.png`
