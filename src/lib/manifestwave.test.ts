import { describe, expect, it } from 'vitest';

import { getCurrentManifestWaveSlot, getSlotCardPath, getZoneBySlot, manifestwaveZones } from './manifestwave';

describe('ManifestWave data helpers', () => {
  it('loads the 24 symbolic hourly ManifestWave zones in order', () => {
    expect(manifestwaveZones).toHaveLength(24);
    expect(manifestwaveZones[0]?.slot).toBe(-11);
    expect(manifestwaveZones.at(-1)?.slot).toBe(12);
  });

  it('returns stable card paths for generated timezone PNG assets', () => {
    expect(getSlotCardPath(-5)).toBe('/assets/manifestwave/timezone-cards/utc-minus-05.png');
    expect(getSlotCardPath(0)).toBe('/assets/manifestwave/timezone-cards/utc-plus-00.png');
    expect(getSlotCardPath(10)).toBe('/assets/manifestwave/timezone-cards/utc-plus-10.png');
  });

  it('finds the UTC-5 card and includes United States regional detail', () => {
    const zone = getZoneBySlot(-5);

    expect(zone.label).toBe('UTC-5');
    expect(zone.countries.some((country) => country.name === 'United States')).toBe(true);
    expect(zone.countries.find((country) => country.name === 'United States')?.detail).toContain('Eastern');
  });

  it('maps the current UTC hour into the symbolic 24-card cycle', () => {
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T05:28:00Z'))).toBe(5);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T13:28:00Z'))).toBe(-11);
    expect(getCurrentManifestWaveSlot(new Date('2026-08-16T23:28:00Z'))).toBe(-1);
  });
});
