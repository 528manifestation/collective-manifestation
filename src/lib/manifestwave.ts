import manifestwaveZoneData from '../data/manifestwave-zones.json';

export type ManifestWaveCountry = {
  id: string;
  name: string;
  isoAlpha2: string;
  detail?: string;
  flagPath: string;
  isMultiSlot?: boolean;
  ianaZone: string;
};

export type ManifestWaveZoneDefinition = {
  slot: number;
  label: string;
  cardFilename: string;
};

export type ManifestWaveZone = {
  slot: number;
  label: string;
  cardFilename: string;
  countries: ManifestWaveCountry[];
};

export type LiveWaveCountryPreview = {
  visibleCountries: ManifestWaveCountry[];
  hiddenCountries: ManifestWaveCountry[];
  hiddenCountryCount: number;
};

type ManifestWaveDataset = {
  zones: ManifestWaveZoneDefinition[];
  countries: ManifestWaveCountry[];
};

const manifestwaveDataset = manifestwaveZoneData as ManifestWaveDataset;
const LIVE_WAVE_COUNTRY_PREVIEW_LIMIT = 6;

export const manifestwaveCountries = manifestwaveDataset.countries;

const distinctIanaZones = Array.from(new Set(manifestwaveCountries.map((country) => country.ianaZone)));
const ianaOffsetFormatters = new Map(
  distinctIanaZones.map((ianaZone) => [
    ianaZone,
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: ianaZone,
      timeZoneName: 'shortOffset',
    }),
  ]),
);
const ianaHourFormatters = new Map(
  distinctIanaZones.map((ianaZone) => [
    ianaZone,
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: ianaZone,
    }),
  ]),
);
const manifestWaveZoneCache = new Map<string, ManifestWaveZone[]>();

function normalizeSlot(slot: number): number {
  if (slot > 12) {
    return slot - 24;
  }

  if (slot < -11) {
    return slot + 24;
  }

  return slot;
}

function parseShortOffsetMinutes(shortOffset: string): number {
  const match = shortOffset.match(/^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/);

  if (!match) {
    throw new Error(`Unable to parse IANA offset: ${shortOffset}`);
  }

  if (!match[1]) {
    return 0;
  }

  const direction = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2] || 0);
  const minutes = Number(match[3] || 0);

  return direction * ((hours * 60) + minutes);
}

function getIanaOffsetMinutes(ianaZone: string, date: Date): number {
  const formatter = ianaOffsetFormatters.get(ianaZone);

  if (!formatter) {
    throw new Error(`Unknown IANA zone: ${ianaZone}`);
  }

  const offsetPart = formatter
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName');

  if (!offsetPart) {
    throw new Error(`Unable to resolve IANA offset for ${ianaZone}`);
  }

  return parseShortOffsetMinutes(offsetPart.value);
}

function getLocalHour(ianaZone: string, date: Date): number {
  const formatter = ianaHourFormatters.get(ianaZone);

  if (!formatter) {
    throw new Error(`Unknown IANA zone: ${ianaZone}`);
  }

  const hourPart = formatter
    .formatToParts(date)
    .find((part) => part.type === 'hour');

  if (!hourPart) {
    throw new Error(`Unable to resolve local hour for ${ianaZone}`);
  }

  return Number(hourPart.value);
}

function getManifestWaveSlotForCountry(country: ManifestWaveCountry, date: Date): number {
  const offsetMinutes = getIanaOffsetMinutes(country.ianaZone, date);
  const offsetHour = offsetMinutes < 0 ? Math.ceil(offsetMinutes / 60) : Math.floor(offsetMinutes / 60);

  return normalizeSlot(offsetHour);
}

export function getCountriesForManifestWaveSlot(slot: number, date = new Date()): ManifestWaveCountry[] {
  const zone = getManifestWaveZones(date).find((item) => item.slot === slot);

  if (!zone) {
    throw new Error(`Unknown ManifestWave slot: ${slot}`);
  }

  return zone.countries;
}

export function getCountriesInFivePmWave(date = new Date()): ManifestWaveCountry[] {
  return manifestwaveCountries.filter((country) => getLocalHour(country.ianaZone, date) === 17);
}

export function getLiveWaveCountryPreview(countries: ManifestWaveCountry[]): LiveWaveCountryPreview {
  const visibleCountries = countries.slice(0, LIVE_WAVE_COUNTRY_PREVIEW_LIMIT);
  const hiddenCountries = countries.slice(LIVE_WAVE_COUNTRY_PREVIEW_LIMIT);

  return {
    visibleCountries,
    hiddenCountries,
    hiddenCountryCount: hiddenCountries.length,
  };
}

export function getManifestWaveHourKey(date = new Date()): string {
  return date.toISOString().slice(0, 13);
}

function resolveManifestWaveZones(date: Date): ManifestWaveZone[] {
  const countriesBySlot = new Map(manifestwaveDataset.zones.map((zone) => [zone.slot, [] as ManifestWaveCountry[]]));

  for (const country of manifestwaveCountries) {
    const slot = getManifestWaveSlotForCountry(country, date);
    const countries = countriesBySlot.get(slot);

    if (countries) {
      countries.push(country);
    }
  }

  return manifestwaveDataset.zones.map((zone) => ({
    ...zone,
    countries: countriesBySlot.get(zone.slot) || [],
  }));
}

export function getManifestWaveZones(date = new Date(), onResolve?: (hourKey: string) => void): ManifestWaveZone[] {
  const hourKey = getManifestWaveHourKey(date);
  const cachedZones = manifestWaveZoneCache.get(hourKey);

  if (cachedZones) {
    return cachedZones;
  }

  onResolve?.(hourKey);
  const zones = resolveManifestWaveZones(date);
  manifestWaveZoneCache.set(hourKey, zones);

  return zones;
}

export const manifestwaveZones = getManifestWaveZones();

export function getZoneBySlot(slot: number, date = new Date()): ManifestWaveZone {
  const zoneDefinition = manifestwaveDataset.zones.find((item) => item.slot === slot);

  if (!zoneDefinition) {
    throw new Error(`Unknown ManifestWave slot: ${slot}`);
  }

  return {
    ...zoneDefinition,
    countries: getCountriesForManifestWaveSlot(slot, date),
  };
}

export function getCurrentManifestWaveSlot(date = new Date()): number {
  const utcHour = date.getUTCHours();
  const slotWhereLocalTimeIsFivePm = 17 - utcHour;

  return normalizeSlot(slotWhereLocalTimeIsFivePm);
}

export function getManifestWaveCountryCount(): number {
  return manifestwaveCountries.length;
}
