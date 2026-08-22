import { describe, expect, it } from 'vitest';

import { getManifestCallAlertState } from './manifestCall';

describe('Manifest Call alert state', () => {
  it('activates from minute 28 through minute 37 of every hour', () => {
    expect(getManifestCallAlertState(new Date('2026-08-16T21:27:59Z')).isActive).toBe(false);
    expect(getManifestCallAlertState(new Date('2026-08-16T21:28:00Z')).isActive).toBe(true);
    expect(getManifestCallAlertState(new Date('2026-08-16T21:37:59Z')).isActive).toBe(true);
    expect(getManifestCallAlertState(new Date('2026-08-16T21:38:00Z')).isActive).toBe(false);
  });

  it('reports minutes until the next 5:28 call outside the alert window', () => {
    expect(getManifestCallAlertState(new Date('2026-08-16T21:00:00Z')).minutesUntilNextCall).toBe(28);
    expect(getManifestCallAlertState(new Date('2026-08-16T21:45:00Z')).minutesUntilNextCall).toBe(43);
  });

  it('uses local device minutes rather than timezone offsets', () => {
    expect(getManifestCallAlertState(new Date(2026, 6, 15, 17, 27, 59)).isActive).toBe(false);
    expect(getManifestCallAlertState(new Date(2026, 6, 15, 17, 28, 0)).isActive).toBe(true);
    expect(getManifestCallAlertState(new Date(2026, 6, 15, 17, 37, 59)).isActive).toBe(true);
    expect(getManifestCallAlertState(new Date(2026, 6, 15, 17, 38, 0)).isActive).toBe(false);
  });
});
