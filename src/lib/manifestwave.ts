import manifestwaveZoneData from '../data/manifestwave-zones.json';

export type ManifestWaveCountry = {
  name: string;
  isoAlpha2: string;
  detail?: string;
  flagPath: string;
  isMultiSlot?: boolean;
};

export type ManifestWaveZone = {
  slot: number;
  label: string;
  cardFilename: string;
  countries: ManifestWaveCountry[];
};

export const manifestwaveZones = manifestwaveZoneData as ManifestWaveZone[];

function getSlotCardFilename(slot: number): string {
  return slot < 0
    ? `utc-minus-${String(Math.abs(slot)).padStart(2, '0')}.png`
    : `utc-plus-${String(slot).padStart(2, '0')}.png`;
}

export function getSlotCardPath(slot: number): string {
  return `/assets/manifestwave/timezone-cards/${getSlotCardFilename(slot)}`;
}

export function getZoneBySlot(slot: number): ManifestWaveZone {
  const zone = manifestwaveZones.find((item) => item.slot === slot);

  if (!zone) {
    throw new Error(`Unknown ManifestWave slot: ${slot}`);
  }

  return zone;
}

export function getCurrentManifestWaveSlot(date = new Date()): number {
  const utcHour = date.getUTCHours();
  return utcHour > 12 ? utcHour - 24 : utcHour;
}

export function getManifestWaveCountryCount(): number {
  return manifestwaveZones.reduce((total, zone) => total + zone.countries.length, 0);
}
