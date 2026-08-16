from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import csv
import html
import shutil
import subprocess
import sys

ROOT = Path(r"C:/Users/Rick/.openclaw/workspace/Projects/collective-manifestation")
SOURCE_ROOT = Path(r"C:/Users/Rick/.hermes/CollectiveManifestation")
FLAG_SOURCE = SOURCE_ROOT / "flag-icons-main" / "flags" / "4x3"
MAP_SOURCE = SOURCE_ROOT / "MapOutlines"
DOCS = ROOT / "docs"
PUBLIC = ROOT / "public" / "assets" / "manifestwave"
FLAGS_OUT = PUBLIC / "flags"
MAPS_OUT = PUBLIC / "maps"
CARDS_OUT = PUBLIC / "timezone-cards"
HTML_OUT = ROOT / "build-assets" / "timezone-card-html"
CHROME = Path(r"C:/Program Files/Google/Chrome/Application/chrome.exe")

DETAIL_CSV = DOCS / "manifestwave-timezone-country-chart.csv"

DISPLAY_FIXES = {
    "Bolivia, Plurinational State of": "Bolivia",
    "Venezuela, Bolivarian Republic of": "Venezuela",
    "Iran, Islamic Republic of": "Iran",
    "Korea, Democratic People's Republic of": "North Korea",
    "Korea, Republic of": "South Korea",
    "Taiwan, Province of China": "Taiwan",
    "Micronesia, Federated States of": "Micronesia",
    "Moldova, Republic of": "Moldova",
    "Netherlands, Kingdom of the": "Netherlands",
    "Tanzania, United Republic of": "Tanzania",
    "Congo, Democratic Republic of the": "Democratic Republic of the Congo",
    "Türkiye": "Turkey",
    "Czechia": "Czech Republic",
    "Falkland Islands (Malvinas)": "Falkland Islands",
    "Palestine, State of": "Palestine",
    "Virgin Islands, British": "British Virgin Islands",
    "Virgin Islands, U.S.": "U.S. Virgin Islands",
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "Russian Federation": "Russia",
    "Viet Nam": "Vietnam",
    "Lao People's Democratic Republic": "Laos",
    "Syrian Arab Republic": "Syria",
    "Brunei Darussalam": "Brunei",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "Curaçao": "Curacao",
    "Réunion": "Reunion",
    "Saint Barthélemy": "Saint Barthelemy",
}

# Display simplification: for card labels we do not want legal/political suffixes.
def clean_name(name: str) -> str:
    return DISPLAY_FIXES.get(name, name)


def slugify(value: str) -> str:
    import re
    import unicodedata

    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def slot_sort(slot_number: str) -> int:
    return int(slot_number)


def slot_filename(slot: int) -> str:
    return f"utc-minus-{abs(slot):02d}.png" if slot < 0 else f"utc-plus-{slot:02d}.png"


def read_detail_rows() -> list[dict[str, str]]:
    with DETAIL_CSV.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def ensure_dirs() -> None:
    for path in [FLAGS_OUT, MAPS_OUT, CARDS_OUT, HTML_OUT, DOCS]:
        path.mkdir(parents=True, exist_ok=True)


def copy_asset(source_path: Path, target_path: Path) -> bool:
    if not source_path.exists():
        return False
    target_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source_path, target_path)
    return True


def collapse_to_slot_country(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: set[tuple[str, str]] = set()
    clean_rows: list[dict[str, str]] = []
    for row in sorted(rows, key=lambda item: (int(item["slot_number"]), clean_name(item["country_or_region"]), item["iso_alpha2"], item["iana_timezone"])):
        key = (row["slot_number"], row["iso_alpha2"])
        if key in seen:
            continue
        seen.add(key)
        cleaned = dict(row)
        cleaned["display_name_clean"] = clean_name(row["country_or_region"])
        cleaned["asset_slug_clean"] = slugify(cleaned["display_name_clean"])
        clean_rows.append(cleaned)
    return clean_rows


def write_clean_csvs(clean_rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    country_fields = [
        "manifest_slot",
        "slot_number",
        "target_card_filename",
        "display_name_clean",
        "country_or_region",
        "iso_alpha2",
        "actual_offset_reference",
        "assigned_symbolic_offset",
        "fractional_offset",
        "multi_slot_country",
        "needs_manual_review",
        "flag_source_file",
        "map_outline_source_file",
        "asset_slug_clean",
        "notes",
    ]
    clean_country_csv = DOCS / "manifestwave-timezone-country-chart-clean.csv"
    with clean_country_csv.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=country_fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows([{field: row.get(field, "") for field in country_fields} for row in clean_rows])

    grouped: defaultdict[int, list[dict[str, str]]] = defaultdict(list)
    for row in clean_rows:
        grouped[int(row["slot_number"])].append(row)

    summary_rows: list[dict[str, str]] = []
    for slot in range(-11, 13):
        rows = sorted(grouped[slot], key=lambda item: item["display_name_clean"])
        labels = []
        for row in rows:
            label = row["display_name_clean"] + (" (parts)" if row["multi_slot_country"] == "yes" else "")
            labels.append(label)
        summary_rows.append(
            {
                "manifest_slot": "UTC+0" if slot == 0 else f"UTC{slot:+d}",
                "slot_number": str(slot),
                "target_card_filename": slot_filename(slot),
                "unique_country_region_count": str(len(rows)),
                "needs_manual_review_rows": str(sum(1 for row in rows if row["needs_manual_review"] == "yes")),
                "countries_regions_for_prompt_clean": "; ".join(labels),
            }
        )

    summary_fields = [
        "manifest_slot",
        "slot_number",
        "target_card_filename",
        "unique_country_region_count",
        "needs_manual_review_rows",
        "countries_regions_for_prompt_clean",
    ]
    clean_summary_csv = DOCS / "manifestwave-timezone-slot-summary-clean.csv"
    with clean_summary_csv.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=summary_fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(summary_rows)

    md_lines = [
        "# ManifestWave 24 Card Lists — Clean Display Names",
        "",
        "These lists follow Option A: 24 symbolic hourly ManifestWave groups.",
        "",
    ]
    for summary in summary_rows:
        md_lines.extend(
            [
                f"## {summary['manifest_slot']} — `{summary['target_card_filename']}`",
                "",
                f"Countries/regions: **{summary['unique_country_region_count']}**  ",
                f"Manual-review rows: **{summary['needs_manual_review_rows']}**",
                "",
                summary["countries_regions_for_prompt_clean"],
                "",
            ]
        )
    (DOCS / "manifestwave-timezone-card-lists.md").write_text("\n".join(md_lines), encoding="utf-8")

    return clean_rows, summary_rows


def build_assets(clean_rows: list[dict[str, str]]) -> list[dict[str, str]]:
    manifest_rows: list[dict[str, str]] = []
    unique_by_code: dict[str, dict[str, str]] = {}
    for row in clean_rows:
        unique_by_code.setdefault(row["iso_alpha2"], row)

    for code, row in sorted(unique_by_code.items(), key=lambda item: item[1]["display_name_clean"]):
        slug = row["asset_slug_clean"]
        flag_source_name = row.get("flag_source_file", "")
        map_source_name = row.get("map_outline_source_file", "")
        flag_target_name = f"{slug}.svg"
        map_target_name = f"{slug}.jpg"
        flag_copied = False
        map_copied = False
        if flag_source_name:
            flag_copied = copy_asset(FLAG_SOURCE / flag_source_name, FLAGS_OUT / flag_target_name)
        if map_source_name:
            map_copied = copy_asset(MAP_SOURCE / map_source_name, MAPS_OUT / map_target_name)
        manifest_rows.append(
            {
                "display_name_clean": row["display_name_clean"],
                "iso_alpha2": code,
                "asset_slug_clean": slug,
                "flag_source_file": flag_source_name,
                "flag_output_file": f"public/assets/manifestwave/flags/{flag_target_name}" if flag_copied else "",
                "flag_status": "copied" if flag_copied else "missing",
                "map_outline_source_file": map_source_name,
                "map_output_file": f"public/assets/manifestwave/maps/{map_target_name}" if map_copied else "",
                "map_status": "copied_unverified_text_cleanup_needed" if map_copied else "missing",
                "notes": "Originals preserved. Clean/review copied map for embedded text before final use." if map_copied else "Map outline missing; use placeholder until sourced.",
            }
        )

    fields = [
        "display_name_clean",
        "iso_alpha2",
        "asset_slug_clean",
        "flag_source_file",
        "flag_output_file",
        "flag_status",
        "map_outline_source_file",
        "map_output_file",
        "map_status",
        "notes",
    ]
    with (DOCS / "manifestwave-asset-manifest.csv").open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(manifest_rows)
    return manifest_rows


def css_for_count(count: int) -> tuple[int, int, str]:
    if count <= 3:
        return 3, 760, "large"
    if count <= 8:
        return 4, 520, "medium"
    if count <= 15:
        return 5, 380, "medium"
    if count <= 25:
        return 5, 250, "dense"
    if count <= 35:
        return 6, 205, "dense"
    return 7, 155, "compact"


def asset_uri(path: Path) -> str:
    return path.resolve().as_uri()


def make_card_html(slot_summary: dict[str, str], rows: list[dict[str, str]]) -> str:
    slot = slot_summary["manifest_slot"]
    count = len(rows)
    cols, min_height, density = css_for_count(count)
    title = f"{slot} ManifestWave Zone"
    subtitle = "5:00 PM – 5:59 PM local wave window | 5:28 PM Manifest Call"
    cards = []
    for row in sorted(rows, key=lambda item: item["display_name_clean"]):
        slug = row["asset_slug_clean"]
        label = row["display_name_clean"] + (" (parts)" if row["multi_slot_country"] == "yes" else "")
        flag_path = FLAGS_OUT / f"{slug}.svg"
        map_path = MAPS_OUT / f"{slug}.jpg"
        flag_html = f'<img class="flag" src="{asset_uri(flag_path)}" alt="{html.escape(label)} flag">' if flag_path.exists() else '<div class="missing flag-missing">Flag pending</div>'
        map_html = f'<img class="map" src="{asset_uri(map_path)}" alt="{html.escape(label)} map outline">' if map_path.exists() else '<div class="missing map-missing">Map pending</div>'
        cards.append(
            f'''<section class="country-card">
  <h2>{html.escape(label)}</h2>
  <div class="visuals">{flag_html}{map_html}</div>
</section>'''
        )
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{html.escape(title)}</title>
<style>
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; width: 3840px; height: 2160px; overflow: hidden; font-family: "Segoe UI", Arial, sans-serif; background: #f8f7fb; color: #211827; }}
body {{ padding: 90px 110px; }}
.frame {{ width: 100%; height: 100%; border: 8px solid #eadff5; border-radius: 54px; background: linear-gradient(180deg, #ffffff 0%, #fbf9ff 100%); box-shadow: inset 0 0 0 2px #f3ecfb; padding: 64px 72px 72px; display: flex; flex-direction: column; }}
.header {{ display: flex; align-items: flex-start; justify-content: space-between; gap: 60px; border-bottom: 6px solid #d7b35a; padding-bottom: {'30px' if density != 'compact' else '22px'}; margin-bottom: {'38px' if density != 'compact' else '26px'}; }}
.title-block h1 {{ margin: 0 0 16px; color: #9c1bb3; font-size: {'104px' if density not in ('dense','compact') else '88px' if density == 'dense' else '76px'}; line-height: 1; letter-spacing: -2px; }}
.title-block p {{ margin: 0; color: #3e3547; font-size: {'43px' if density not in ('dense','compact') else '36px' if density == 'dense' else '31px'}; font-weight: 600; }}
.mark {{ color: #d7a92c; font-weight: 800; font-size: {'72px' if density not in ('dense','compact') else '60px' if density == 'dense' else '52px'}; line-height: 1; text-align: right; white-space: nowrap; }}
.grid {{ flex: 1; display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); grid-auto-rows: {min_height}px; gap: {'26px' if density not in ('dense','compact') else '20px' if density == 'dense' else '14px'}; align-content: start; }}
.country-card {{ height: {min_height}px; position: relative; border: 3px solid #e7dfed; border-radius: {'28px' if density not in ('dense','compact') else '22px'}; background: #fff; padding: {'22px 24px' if density not in ('dense','compact') else '16px 18px' if density == 'dense' else '10px 12px'}; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 26px rgba(48, 20, 65, .08); overflow: hidden; }}
.country-card h2 {{ margin: 0 0 {'18px' if density not in ('dense','compact') else '10px'}; color: #2b2031; font-size: {'42px' if density == 'large' else '34px' if density == 'medium' else '25px' if density == 'dense' else '18px'}; line-height: 1.08; font-weight: 750; }}
.visuals {{ display: grid; grid-template-columns: 42% 58%; align-items: center; gap: {'18px' if density not in ('dense','compact') else '10px'}; min-height: 0; }}
.flag {{ width: 100%; max-height: {'240px' if density == 'large' else '150px' if density == 'medium' else '82px' if density == 'dense' else '54px'}; object-fit: contain; border: 2px solid #eee; border-radius: 8px; background: #fff; }}
.map {{ width: 100%; max-height: {'290px' if density == 'large' else '180px' if density == 'medium' else '92px' if density == 'dense' else '58px'}; object-fit: contain; mix-blend-mode: multiply; filter: grayscale(1) contrast(1.15); }}
.missing {{ border: 3px dashed #cdb8d6; border-radius: 14px; min-height: 86px; display: flex; align-items: center; justify-content: center; color: #80698d; font-size: 24px; font-weight: 700; background: #faf7fc; text-align: center; }}
.footer-note {{ margin-top: {'34px' if density not in ('dense','compact') else '22px'}; color: #75687d; font-size: {'28px' if density != 'compact' else '22px'}; display: flex; justify-content: space-between; gap: 40px; }}
</style>
</head>
<body>
  <main class="frame">
    <header class="header">
      <div class="title-block">
        <h1>{html.escape(title)}</h1>
        <p>{html.escape(subtitle)}</p>
      </div>
      <div class="mark">ManifestWave<br>528</div>
    </header>
    <div class="grid">
      {''.join(cards)}
    </div>
    <div class="footer-note"><span>Symbolic 24-hour wave grouping. Some countries/regions span multiple zones.</span><span>CollectiveManifestation.org</span></div>
  </main>
</body>
</html>
'''


def write_html_and_pngs(clean_rows: list[dict[str, str]], summary_rows: list[dict[str, str]]) -> int:
    grouped: defaultdict[int, list[dict[str, str]]] = defaultdict(list)
    for row in clean_rows:
        grouped[int(row["slot_number"])].append(row)
    written = 0
    for summary in summary_rows:
        slot = int(summary["slot_number"])
        stem = Path(summary["target_card_filename"]).stem
        html_path = HTML_OUT / f"{stem}.html"
        png_path = CARDS_OUT / summary["target_card_filename"]
        html_path.write_text(make_card_html(summary, grouped[slot]), encoding="utf-8")
        if CHROME.exists():
            subprocess.run(
                [
                    str(CHROME),
                    "--headless=new",
                    "--disable-gpu",
                    "--hide-scrollbars",
                    "--window-size=3840,2160",
                    f"--screenshot={png_path}",
                    html_path.resolve().as_uri(),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        written += 1
    return written


def main() -> None:
    ensure_dirs()
    detail_rows = read_detail_rows()
    clean_rows = collapse_to_slot_country(detail_rows)
    clean_rows, summary_rows = write_clean_csvs(clean_rows)
    manifest_rows = build_assets(clean_rows)
    card_count = write_html_and_pngs(clean_rows, summary_rows)

    missing_flags = sum(1 for row in manifest_rows if row["flag_status"] == "missing")
    missing_maps = sum(1 for row in manifest_rows if row["map_status"] == "missing")
    copied_flags = sum(1 for row in manifest_rows if row["flag_status"] == "copied")
    copied_maps = sum(1 for row in manifest_rows if row["map_status"] != "missing")

    notes = f"""# ManifestWave Card Build Report

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

- Unique country/region slot rows: {len(clean_rows)}
- Unique country/region assets in manifest: {len(manifest_rows)}
- Flags copied: {copied_flags}
- Flags missing: {missing_flags}
- Map outlines copied: {copied_maps}
- Map outlines missing: {missing_maps}
- Draft PNG cards generated: {card_count}

## Important QA status

These are **draft** cards. Before final website use:

1. Open `docs/manifestwave-asset-manifest.csv` and review missing maps/flags.
2. Inspect copied map outlines for embedded text/labels.
3. Replace or clean copied map files in `public/assets/manifestwave/maps/` as needed.
4. Regenerate cards after cleanup.
5. Verify dense cards like `utc-plus-01.png`, `utc-plus-02.png`, and `utc-minus-04.png` for readability.

Original assets were not modified.
"""
    (DOCS / "manifestwave-card-build-report.md").write_text(notes, encoding="utf-8")

    print(notes)


if __name__ == "__main__":
    main()
