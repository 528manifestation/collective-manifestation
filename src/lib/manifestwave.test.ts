import { describe, expect, it } from 'vitest';

import {
  getCurrentManifestWaveSlot,
  getManifestWaveCountryCount,
  getSlotCardPath,
  getZoneBySlot,
  manifestwaveZones,
} from './manifestwave';

describe('ManifestWave data helpers', () => {
  it('loads the 24 symbolic hourly ManifestWave zones in order', () => {
    expect(manifestwaveZones).toHaveLength(24);
    expect(manifestwaveZones[0]?.slot).toBe(-11);
    expect(manifestwaveZones.at(-1)?.slot).toBe(12);
  });

  it('loads the full cleaned ManifestWave country dataset', () => {
    expect(getManifestWaveCountryCount()).toBe(302);
    expect(getZoneBySlot(1).countries.length).toBeGreaterThan(40);
    expect(getZoneBySlot(2).countries.length).toBeGreaterThan(30);
  });

  it('returns stable card paths for generated timezone PNG assets', () => {
    expect(getSlotCardPath(-5)).toBe('/assets/manifestwave/timezone-cards/utc-minus-05.png');
    expect(getSlotCardPath(0)).toBe('/assets/manifestwave/timezone-cards/utc-plus-00.png');
    expect(getSlotCardPath(10)).toBe('/assets/manifestwave/timezone-cards/utc-plus-10.png');
  });

  it('finds the UTC-5 card and includes United States state/regional detail', () => {
    const zone = getZoneBySlot(-5);
    const unitedStates = zone.countries.find((country) => country.name === 'United States');

    expect(zone.label).toBe('UTC-5');
    expect(unitedStates).toBeDefined();
    expect(unitedStates?.detail).toContain('Eastern');
    expect(unitedStates?.detail).toContain('CT');
    expect(unitedStates?.detail).toContain('Florida');
  });

  it('maps the current UTC hour into the symbolic 24-card cycle', () => {
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T05:28:00Z'))).toBe(5);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T13:28:00Z'))).toBe(-11);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T23:28:00Z'))).toBe(-1);
  });
});
