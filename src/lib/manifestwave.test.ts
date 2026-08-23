import { describe, expect, it } from 'vitest';

import manifestwaveCountryIdsSnapshot from '../data/manifestwave-country-ids.snapshot.json';
import {
  getCurrentManifestWaveSlot,
  getCountriesForManifestWaveSlot,
  getCountriesInFivePmWave,
  getLiveWaveCountryPreview,
  getManifestWaveHourKey,
  getManifestWaveZones,
  getManifestWaveCountryCount,
  getZoneBySlot,
  manifestwaveCountries,
  manifestwaveZones,
} from './manifestwave';

function countCountriesByZone(countries: { ianaZone: string }[], ianaZone: string): number {
  return countries.filter((country) => country.ianaZone === ianaZone).length;
}

function getTestLocalHour(ianaZone: string, date: Date): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: ianaZone,
  });
  const hourPart = formatter
    .formatToParts(date)
    .find((part) => part.type === 'hour');

  if (!hourPart) {
    throw new Error(`Unable to resolve local hour for ${ianaZone}`);
  }

  return Number(hourPart.value);
}

describe('ManifestWave data helpers', () => {
  it('loads the 24 symbolic hourly ManifestWave zones in order', () => {
    expect(manifestwaveZones).toHaveLength(24);
    expect(manifestwaveZones[0]?.slot).toBe(-11);
    expect(manifestwaveZones.at(-1)?.slot).toBe(12);
  });

  it('loads the full cleaned ManifestWave country dataset', () => {
    const january = new Date('2026-01-15T12:00:00Z');

    expect(getManifestWaveCountryCount()).toBeGreaterThanOrEqual(300);
    expect(getManifestWaveCountryCount()).toBeLessThan(350);
    expect(getZoneBySlot(1, january).countries.length).toBeGreaterThan(40);
    expect(getZoneBySlot(2, january).countries.length).toBeGreaterThan(25);
  });

  it('does not store per-country slot assignments', () => {
    expect(manifestwaveCountries.some((country) => 'slot' in country)).toBe(false);
  });

  it('keeps stored country entry ids unique so rendering keys cannot collide', () => {
    const ids = manifestwaveCountries.map((country) => country.id);

    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the full country id list stable and reviewable', () => {
    const sortedIds = manifestwaveCountries.map((country) => country.id).sort();

    expect(sortedIds).toEqual(manifestwaveCountryIdsSnapshot);
  });

  it('resolves zone membership once per UTC hour key across per-second ticks', () => {
    const start = new Date('2035-04-10T10:00:00Z');
    const hourKey = getManifestWaveHourKey(start);
    let resolveCount = 0;

    for (let second = 0; second < 60; second += 1) {
      getManifestWaveZones(new Date(start.getTime() + (second * 1000)), (resolvedHourKey) => {
        expect(resolvedHourKey).toBe(hourKey);
        resolveCount += 1;
      });
    }

    expect(resolveCount).toBe(1);
  });

  it('keeps manually reviewed multi-zone country entries on distinct IANA zones', () => {
    expect(manifestwaveCountries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ detail: expect.stringContaining('Central - NU'), ianaZone: 'America/Winnipeg' }),
        expect.objectContaining({ detail: expect.stringContaining('Atlantic - NS'), ianaZone: 'America/Halifax' }),
        expect.objectContaining({ detail: 'MST - BC (most areas)', ianaZone: 'America/Dawson_Creek' }),
        expect.objectContaining({ detail: expect.stringContaining('MSK+04'), ianaZone: 'Asia/Krasnoyarsk' }),
      ]),
    );
  });

  it('caps live wave country previews and reports hidden country count', () => {
    const zone = getZoneBySlot(1, new Date('2026-01-15T12:00:00Z'));
    const preview = getLiveWaveCountryPreview(zone.countries);

    expect(preview.visibleCountries).toHaveLength(6);
    expect(preview.hiddenCountryCount).toBe(zone.countries.length - 6);
  });

  it('finds the UTC-5 card and includes United States state/regional detail', () => {
    const zone = getZoneBySlot(-5, new Date('2026-01-15T12:00:00Z'));
    const unitedStates = zone.countries.find((country) => country.name === 'United States');

    expect(zone.label).toBe('UTC-5');
    expect(unitedStates).toBeDefined();
    expect(unitedStates?.detail).toContain('Eastern');
    expect(unitedStates?.detail).toContain('CT');
    expect(unitedStates?.detail).toContain('Florida');
  });

  it('maps the current time to the zone where local time is in the 5 PM wave hour', () => {
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T05:28:00Z'))).toBe(12);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T13:28:00Z'))).toBe(4);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T23:28:00Z'))).toBe(-6);
  });

  it('resolves country membership from IANA zones so DST countries move seasonally', () => {
    const january = new Date('2026-01-15T12:00:00Z');
    const july = new Date('2026-07-15T12:00:00Z');

    expect(getCountriesForManifestWaveSlot(0, january).some((country) => country.name === 'United Kingdom')).toBe(true);
    expect(getCountriesForManifestWaveSlot(1, january).some((country) => country.name === 'United Kingdom')).toBe(false);

    expect(getCountriesForManifestWaveSlot(0, july).some((country) => country.name === 'United Kingdom')).toBe(false);
    expect(getCountriesForManifestWaveSlot(1, july).some((country) => country.name === 'United Kingdom')).toBe(true);
  });

  it('keeps non-DST countries in the same resolved slot year-round', () => {
    const january = new Date('2026-01-15T12:00:00Z');
    const july = new Date('2026-07-15T12:00:00Z');

    expect(getCountriesForManifestWaveSlot(9, january).some((country) => country.name === 'Japan')).toBe(true);
    expect(getCountriesForManifestWaveSlot(9, july).some((country) => country.name === 'Japan')).toBe(true);
  });

  it('returns the countries whose local hour is currently 5 PM', () => {
    const activeCountries = getCountriesInFivePmWave(new Date('2026-07-15T16:28:00Z'));

    expect(activeCountries.some((country) => country.name === 'United Kingdom')).toBe(true);
    expect(activeCountries.every((country) => country.ianaZone)).toBe(true);
  });

  it('only returns countries whose IANA local hour is 17 across January and July day cycles', () => {
    const dates = ['2026-01-15', '2026-07-15'].flatMap((day) => (
      Array.from({ length: 24 }, (_, hour) => new Date(`${day}T${String(hour).padStart(2, '0')}:28:00Z`))
    ));

    for (const date of dates) {
      for (const country of getCountriesInFivePmWave(date)) {
        expect(getTestLocalHour(country.ianaZone, date), `${country.id} at ${date.toISOString()}`).toBe(17);
      }
    }
  });

  it('handles half-hour and quarter-hour 5 PM wave windows exactly once', () => {
    const cases = [
      {
        ianaZone: 'Asia/Kolkata',
        inWindow: [new Date('2026-07-15T11:30:00Z'), new Date('2026-07-15T12:29:00Z')],
        outsideWindow: [new Date('2026-07-15T11:29:00Z'), new Date('2026-07-15T12:30:00Z')],
      },
      {
        ianaZone: 'Asia/Kathmandu',
        inWindow: [new Date('2026-07-15T11:15:00Z'), new Date('2026-07-15T12:14:00Z')],
        outsideWindow: [new Date('2026-07-15T11:14:00Z'), new Date('2026-07-15T12:15:00Z')],
      },
      {
        ianaZone: 'Pacific/Chatham',
        inWindow: [new Date('2026-07-15T04:15:00Z'), new Date('2026-07-15T05:14:00Z')],
        outsideWindow: [new Date('2026-07-15T04:14:00Z'), new Date('2026-07-15T05:15:00Z')],
      },
    ];

    for (const { ianaZone, inWindow, outsideWindow } of cases) {
      for (const date of inWindow) {
        expect(countCountriesByZone(getCountriesInFivePmWave(date), ianaZone)).toBe(1);
      }

      for (const date of outsideWindow) {
        expect(countCountriesByZone(getCountriesInFivePmWave(date), ianaZone)).toBe(0);
      }
    }
  });
});
