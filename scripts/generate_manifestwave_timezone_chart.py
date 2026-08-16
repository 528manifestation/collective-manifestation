from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
import csv
import html
import io
import math
import re
import urllib.request
import zipfile

ROOT = Path(r"C:/Users/Rick/.openclaw/workspace/Projects/collective-manifestation")
SOURCE_ROOT = Path(r"C:/Users/Rick/.hermes/CollectiveManifestation")
FLAG_ROOT = SOURCE_ROOT / "flag-icons-main" / "flags" / "4x3"
MAP_ROOT = SOURCE_ROOT / "MapOutlines"
DOCS = ROOT / "docs"
DOCS.mkdir(parents=True, exist_ok=True)

ZONE_URL = "https://data.iana.org/time-zones/tzdb/zone1970.tab"
ISO_URL = "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv"

NAME_FIXES = {
    "United States of America": "United States",
    "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
    "Russian Federation": "Russia",
    "Iran (Islamic Republic of)": "Iran",
    "Bolivia (Plurinational State of)": "Bolivia",
    "Venezuela (Bolivarian Republic of)": "Venezuela",
    "Viet Nam": "Vietnam",
    "Lao People's Democratic Republic": "Laos",
    "Syrian Arab Republic": "Syria",
    "Korea (Republic of)": "South Korea",
    "Korea (Democratic People's Republic of)": "North Korea",
    "Moldova (Republic of)": "Moldova",
    "Tanzania, United Republic of": "Tanzania",
    "Brunei Darussalam": "Brunei",
    "Micronesia (Federated States of)": "Micronesia",
    "Congo": "Republic of the Congo",
    "Congo (Democratic Republic of the)": "Democratic Republic of the Congo",
    "Côte d'Ivoire": "Cote d'Ivoire",
    "Curaçao": "Curacao",
    "Réunion": "Reunion",
    "Saint Barthélemy": "Saint Barthelemy",
    "Saint Martin (French part)": "Saint Martin",
    "Virgin Islands (British)": "British Virgin Islands",
    "Virgin Islands (U.S.)": "U.S. Virgin Islands",
}

MAP_ALIASES = {
    "unitedstates": "UnitedStates.jpg",
    "unitedkingdom": "UnitedKingdom.jpg",
    "unitedarabemirates": "UnitedArabEmirates.jpg",
    "southafrica": "SouthAfrica.jpg",
    "southkorea": "SouthKorea.jpg",
    "northkorea": "NorthKorea.jpg",
    "saintbarthelemy": "SaintBarthelemy.jpg",
    "britishvirginislands": "VirginIslands.jpg",
    "usvirginislands": "VirginIslands.jpg",
    "cotedivoire": "CotedIvoire.jpg",
    "bosniaandherzegovina": "BosniaandHerzegovina.jpg",
    "papuanewguinea": "PapuaNewGuinea.jpg",
    "saotomeandprincipe": "SaoTomeandPrincipe.jpg",
    "trinidadandtobago": "TrinidadandTobago.jpg",
    "turksandcaicosislands": "TurksandCaicosIslands.jpg",
    "wallisandfutuna": "WallisandFutunaIslands.jpg",
    "falklandislands": "FalklandIslands.jpg",
    "faroeislands": "FaroeIslands.jpg",
    "marshallislands": "MarshallIslands.jpg",
    "northernmarianaislands": "NorthernMarianaIslands.jpg",
    "solomonislands": "SolomonIslands.jpg",
    "cookislands": "CookIslands.jpg",
    "caymanislands": "CaymanIslands.jpg",
    "cocoskeelingislands": "CocosIslands.jpg",
    "christmasisland": "ChristmasIsland.jpg",
    "frenchpolynesia": "FrenchPolynesia.jpg",
    "frenchsouthernterritories": "FrenchSouthernTerritories.jpg",
    "saintvincentandthegrenadines": "SaintVincentandtheGrenadines.jpg",
    "saintkittsandnevis": "SaintKittsandNevis.jpg",
    "saintlucia": "SaintLucia.jpg",
}

SLOTS = list(range(-11, 13))
REF_DATE = datetime(2026, 1, 15, 12, 0, 0)


def fetch_text(url: str) -> str:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode("utf-8-sig")


def key_name(name: str) -> str:
    import unicodedata

    normalized = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    normalized = normalized.replace("&", "and")
    return re.sub(r"[^a-z0-9]", "", normalized.lower())


def slug_name(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def slot_label(slot: int) -> str:
    return "UTC+0" if slot == 0 else f"UTC{slot:+d}"


def slot_filename(slot: int) -> str:
    if slot < 0:
        return f"utc-minus-{abs(slot):02d}.png"
    return f"utc-plus-{slot:02d}.png"


def round_half_away_from_zero(value: float) -> int:
    if value >= 0:
        return int(math.floor(value + 0.5))
    return int(math.ceil(value - 0.5))


def normalize_to_24_slots(hour: int) -> int:
    while hour < -11:
        hour += 24
    while hour > 12:
        hour -= 24
    return hour


def minutes_to_offset(minutes: int) -> str:
    sign = "+" if minutes >= 0 else "-"
    absolute = abs(int(minutes))
    return f"UTC{sign}{absolute // 60:02d}:{absolute % 60:02d}"


def display_name(code: str, iso_by_code: dict[str, str]) -> str:
    raw = iso_by_code.get(code, code)
    return NAME_FIXES.get(raw, raw)


def build_map_index() -> dict[str, str]:
    index: dict[str, str] = {}
    if not MAP_ROOT.exists():
        return index
    for path in MAP_ROOT.glob("*.jpg"):
        # Handles names like Sudan(1).jpg and Turkey2.jpg.
        stem = re.sub(r"(?:\(\d+\)|\d+)$", "", path.stem)
        index.setdefault(key_name(stem), path.name)
    return index


def map_file_for(name: str, map_index: dict[str, str]) -> str:
    lookup = key_name(name)
    if lookup in map_index:
        return map_index[lookup]
    alias = MAP_ALIASES.get(lookup)
    if alias and (MAP_ROOT / alias).exists():
        return alias
    return ""


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def column_name(number: int) -> str:
    result = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def sheet_xml(fields: list[str], rows: list[dict[str, object]]) -> str:
    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetData>',
    ]
    all_rows = [fields] + [[str(row.get(field, "")) for field in fields] for row in rows]
    for row_index, values in enumerate(all_rows, start=1):
        xml_parts.append(f'<row r="{row_index}">')
        for column_index, value in enumerate(values, start=1):
            cell = f"{column_name(column_index)}{row_index}"
            safe_value = html.escape(str(value), quote=False)
            xml_parts.append(f'<c r="{cell}" t="inlineStr"><is><t>{safe_value}</t></is></c>')
        xml_parts.append("</row>")
    xml_parts.append("</sheetData></worksheet>")
    return "".join(xml_parts)


def write_xlsx(path: Path, summary_fields: list[str], summary_rows: list[dict[str, object]], detail_fields: list[str], detail_rows: list[dict[str, object]]) -> None:
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>''',
        )
        archive.writestr(
            "_rels/.rels",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>''',
        )
        archive.writestr(
            "xl/workbook.xml",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Slot Summary" sheetId="1" r:id="rId1"/><sheet name="Country Detail" sheetId="2" r:id="rId2"/></sheets>
</workbook>''',
        )
        archive.writestr(
            "xl/_rels/workbook.xml.rels",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''',
        )
        archive.writestr(
            "xl/styles.xml",
            '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="1"><xf/></cellXfs></styleSheet>''',
        )
        archive.writestr("xl/worksheets/sheet1.xml", sheet_xml(summary_fields, summary_rows))
        archive.writestr("xl/worksheets/sheet2.xml", sheet_xml(detail_fields, detail_rows))


def main() -> None:
    zone_text = fetch_text(ZONE_URL)
    iso_text = fetch_text(ISO_URL)

    iso_by_code: dict[str, str] = {}
    for row in csv.DictReader(io.StringIO(iso_text)):
        iso_by_code[row["alpha-2"].strip().upper()] = row["name"].strip()

    map_index = build_map_index()
    rows: list[dict[str, object]] = []
    seen: set[tuple[int, str, str]] = set()
    country_slots: defaultdict[str, set[int]] = defaultdict(set)

    for line in zone_text.splitlines():
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        country_codes, _coords, timezone_name = parts[:3]
        comments = parts[3] if len(parts) > 3 else ""
        try:
            offset = ZoneInfo(timezone_name).utcoffset(REF_DATE)
        except Exception:
            continue
        if offset is None:
            continue

        minutes = int(offset.total_seconds() // 60)
        rounded_hour = round_half_away_from_zero(minutes / 60)
        slot = normalize_to_24_slots(rounded_hour)
        fractional = abs(minutes) % 60 != 0
        wrapped = rounded_hour != slot

        for code in country_codes.split(","):
            code = code.strip().upper()
            row_key = (slot, code, timezone_name)
            if row_key in seen:
                continue
            seen.add(row_key)
            country_slots[code].add(slot)

            name = display_name(code, iso_by_code)
            flag_file = f"{code.lower()}.svg" if (FLAG_ROOT / f"{code.lower()}.svg").exists() else ""
            map_file = map_file_for(name, map_index)
            notes: list[str] = []
            if fractional:
                notes.append("fractional actual UTC offset; assigned to nearest symbolic hourly slot")
            if wrapped:
                notes.append(f"actual rounded offset UTC{rounded_hour:+d} wraps to {slot_label(slot)} in 24-slot cycle")
            if comments:
                notes.append(comments)

            rows.append(
                {
                    "manifest_slot": slot_label(slot),
                    "slot_number": slot,
                    "target_card_filename": slot_filename(slot),
                    "country_or_region": name,
                    "iso_alpha2": code,
                    "iana_timezone": timezone_name,
                    "actual_offset_reference": minutes_to_offset(minutes),
                    "assigned_symbolic_offset": slot_label(slot),
                    "fractional_offset": "yes" if fractional else "no",
                    "multi_slot_country": "",
                    "needs_manual_review": "",
                    "flag_source_file": flag_file,
                    "map_outline_source_file": map_file,
                    "suggested_asset_slug": slug_name(name),
                    "notes": "; ".join(notes),
                }
            )

    for row in rows:
        multi_slot = len(country_slots[str(row["iso_alpha2"])]) > 1
        row["multi_slot_country"] = "yes" if multi_slot else "no"
        row["needs_manual_review"] = (
            "yes"
            if row["fractional_offset"] == "yes"
            or multi_slot
            or not row["flag_source_file"]
            or not row["map_outline_source_file"]
            or "wraps" in str(row["notes"])
            else "no"
        )
        if multi_slot:
            row["notes"] = (str(row["notes"]) + "; " if row["notes"] else "") + "country/region appears in multiple symbolic slots"

    rows.sort(key=lambda row: (int(row["slot_number"]), str(row["country_or_region"]), str(row["iana_timezone"])))

    detail_fields = [
        "manifest_slot",
        "slot_number",
        "target_card_filename",
        "country_or_region",
        "iso_alpha2",
        "iana_timezone",
        "actual_offset_reference",
        "assigned_symbolic_offset",
        "fractional_offset",
        "multi_slot_country",
        "needs_manual_review",
        "flag_source_file",
        "map_outline_source_file",
        "suggested_asset_slug",
        "notes",
    ]

    summary_rows: list[dict[str, object]] = []
    for slot in SLOTS:
        slot_rows = [row for row in rows if int(row["slot_number"]) == slot]
        country_labels: list[str] = []
        unique_codes = sorted({str(row["iso_alpha2"]) for row in slot_rows}, key=lambda code: display_name(code, iso_by_code))
        for code in unique_codes:
            name = display_name(code, iso_by_code)
            label = name + (" (parts)" if len(country_slots[code]) > 1 else "")
            country_labels.append(label)
        summary_rows.append(
            {
                "manifest_slot": slot_label(slot),
                "slot_number": slot,
                "target_card_filename": slot_filename(slot),
                "unique_country_region_count": len(country_labels),
                "needs_manual_review_rows": sum(1 for row in slot_rows if row["needs_manual_review"] == "yes"),
                "countries_regions_for_prompt": "; ".join(country_labels),
            }
        )

    summary_fields = [
        "manifest_slot",
        "slot_number",
        "target_card_filename",
        "unique_country_region_count",
        "needs_manual_review_rows",
        "countries_regions_for_prompt",
    ]

    country_csv = DOCS / "manifestwave-timezone-country-chart.csv"
    summary_csv = DOCS / "manifestwave-timezone-slot-summary.csv"
    xlsx = DOCS / "manifestwave-timezone-chart.xlsx"
    notes_path = DOCS / "manifestwave-timezone-spreadsheet-notes.md"

    write_csv(country_csv, detail_fields, rows)
    write_csv(summary_csv, summary_fields, summary_rows)
    write_xlsx(xlsx, summary_fields, summary_rows, detail_fields, rows)

    notes_path.write_text(
        f"""# ManifestWave Time-Zone Spreadsheet Notes

Generated for the Collective Manifestation project.

## Files created

- `docs/manifestwave-timezone-chart.xlsx` — Excel workbook with two tabs: `Slot Summary` and `Country Detail`.
- `docs/manifestwave-timezone-slot-summary.csv` — prompt-ready row per ManifestWave card/slot.
- `docs/manifestwave-timezone-country-chart.csv` — detailed row per country/time-zone reference.

## Data sources

- IANA tzdb `zone1970.tab`: `{ZONE_URL}`
- ISO-3166 country names: `{ISO_URL}`
- Local flags: `C:\\Users\\Rick\\.hermes\\CollectiveManifestation\\flag-icons-main\\flags\\4x3`
- Local map outlines: `C:\\Users\\Rick\\.hermes\\CollectiveManifestation\\MapOutlines`

## Assignment model

Rick selected **Option A: 24 symbolic hourly ManifestWave groups**.

The spreadsheet uses 24 display cards from `UTC-11` through `UTC+12`. Real civil offsets that fall outside that range wrap around the 24-hour cycle, for example `UTC+13` maps to the `UTC-11` card and `UTC+14` maps to the `UTC-10` card.

Fractional offsets are assigned to the nearest symbolic hourly slot and flagged for manual review. Example: Afghanistan has an actual offset of `UTC+04:30`, so it is assigned to the symbolic `UTC+5` card.

Reference date used for offset calculation: `{REF_DATE.date().isoformat()}`. Some countries observe daylight saving time, so countries marked `multi_slot_country = yes` or `needs_manual_review = yes` should be reviewed before final card generation.

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
""",
        encoding="utf-8",
    )

    print(f"Generated {len(rows)} detail rows and {len(summary_rows)} slot rows.")
    for path in [xlsx, summary_csv, country_csv, notes_path]:
        print(path)


if __name__ == "__main__":
    main()
