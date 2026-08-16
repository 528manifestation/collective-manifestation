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

const makeZone = (slot: number, countries: ManifestWaveCountry[] = []): ManifestWaveZone => ({
  slot,
  label: slot === 0 ? 'UTC+0' : `UTC${slot > 0 ? '+' : ''}${slot}`,
  cardFilename: getSlotCardFilename(slot),
  countries,
});

const country = (
  name: string,
  isoAlpha2: string,
  detail = '',
  isMultiSlot = false,
): ManifestWaveCountry => ({
  name,
  isoAlpha2,
  detail,
  isMultiSlot,
  flagPath: `/assets/manifestwave/flags/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.svg`,
});

function getSlotCardFilename(slot: number): string {
  return slot < 0 ? `utc-minus-${String(Math.abs(slot)).padStart(2, '0')}.png` : `utc-plus-${String(slot).padStart(2, '0')}.png`;
}

export const manifestwaveZones: ManifestWaveZone[] = [
  makeZone(-11, [country('American Samoa', 'AS'), country('New Zealand', 'NZ', 'Auckland; symbolic wrap', true)]),
  makeZone(-10, [country('Cook Islands', 'CK'), country('French Polynesia', 'PF', 'Marquesas; Tahiti', true), country('United States', 'US', 'Hawaii; Alaska — western Aleutians', true)]),
  makeZone(-9, [country('French Polynesia', 'PF', 'Gambier Islands', true), country('United States', 'US', 'Alaska — most areas, Juneau, Nome, Sitka, Yakutat', true)]),
  makeZone(-8, [country('Canada', 'CA', 'MST — BC (most areas)', true), country('Mexico', 'MX', 'Baja California', true), country('Pitcairn', 'PN'), country('United States', 'US', 'Pacific — California, Nevada, Washington, Oregon, Idaho panhandle', true)]),
  makeZone(-7, [country('Canada', 'CA', 'Mountain regions', true), country('Mexico', 'MX', 'Mountain/Pacific regions', true), country('United States', 'US', 'Mountain — Arizona, Colorado, Montana, New Mexico, Utah, Wyoming; parts of Idaho, Oregon, North Dakota, Nebraska, Kansas, Texas', true)]),
  makeZone(-6, [country('Belize', 'BZ'), country('Canada', 'CA', 'Central regions', true), country('Costa Rica', 'CR'), country('El Salvador', 'SV'), country('Guatemala', 'GT'), country('Honduras', 'HN'), country('Mexico', 'MX', 'Central regions', true), country('Nicaragua', 'NI'), country('United States', 'US', 'Central — Alabama, Arkansas, Illinois, Iowa, Louisiana, Minnesota, Mississippi, Missouri, Oklahoma, Wisconsin, most Texas; parts of Florida, Indiana, Kansas, Kentucky, Michigan, Nebraska, North Dakota, South Dakota, Tennessee', true)]),
  makeZone(-5, [country('Bahamas', 'BS'), country('Brazil', 'BR', 'Amazonas (west); Acre', true), country('Canada', 'CA', 'Eastern — ON & QC regions', true), country('Colombia', 'CO'), country('Cuba', 'CU'), country('Ecuador', 'EC', 'Mainland', true), country('Haiti', 'HT'), country('Jamaica', 'JM'), country('Mexico', 'MX', 'Quintana Roo', true), country('Panama', 'PA'), country('Peru', 'PE'), country('United States', 'US', 'Eastern — CT, DC, DE, GA, ME, MD, MA, NH, NJ, NY, NC, OH, PA, RI, SC, VT, VA, WV; parts of Florida, Indiana, Kentucky, Michigan, Tennessee', true)]),
  makeZone(-4, [country('Antigua and Barbuda', 'AG'), country('Argentina', 'AR'), country('Aruba', 'AW'), country('Barbados', 'BB'), country('Bolivia', 'BO'), country('Brazil', 'BR', 'Atlantic regions', true), country('Canada', 'CA', 'Atlantic regions', true), country('Chile', 'CL', 'Mainland', true), country('Dominican Republic', 'DO'), country('Puerto Rico', 'PR'), country('Venezuela', 'VE')]),
  makeZone(-3, [country('Argentina', 'AR'), country('Brazil', 'BR', 'East regions', true), country('Chile', 'CL', 'Magallanes', true), country('Greenland', 'GL', 'West regions', true), country('Paraguay', 'PY'), country('Uruguay', 'UY')]),
  makeZone(-2, [country('Brazil', 'BR', 'Atlantic islands', true), country('South Georgia and the South Sandwich Islands', 'GS')]),
  makeZone(-1, [country('Cabo Verde', 'CV'), country('Greenland', 'GL', 'East regions', true)]),
  makeZone(0, [country('Ghana', 'GH'), country('Iceland', 'IS'), country('Ireland', 'IE'), country('Portugal', 'PT', 'Mainland/Madeira', true), country('Senegal', 'SN'), country('United Kingdom', 'GB')]),
  makeZone(1, [country('Albania', 'AL'), country('Algeria', 'DZ'), country('Austria', 'AT'), country('Belgium', 'BE'), country('France', 'FR'), country('Germany', 'DE'), country('Italy', 'IT'), country('Netherlands', 'NL'), country('Norway', 'NO'), country('Poland', 'PL'), country('Spain', 'ES', 'Mainland', true), country('Sweden', 'SE'), country('Switzerland', 'CH')]),
  makeZone(2, [country('Bulgaria', 'BG'), country('Cyprus', 'CY'), country('Egypt', 'EG'), country('Finland', 'FI'), country('Greece', 'GR'), country('Israel', 'IL'), country('Romania', 'RO'), country('South Africa', 'ZA'), country('Turkey', 'TR'), country('Ukraine', 'UA')]),
  makeZone(3, [country('Bahrain', 'BH'), country('Iraq', 'IQ'), country('Kenya', 'KE'), country('Kuwait', 'KW'), country('Qatar', 'QA'), country('Russia', 'RU', 'Western regions', true), country('Saudi Arabia', 'SA')]),
  makeZone(4, [country('Armenia', 'AM'), country('Azerbaijan', 'AZ'), country('Georgia', 'GE'), country('Oman', 'OM'), country('United Arab Emirates', 'AE')]),
  makeZone(5, [country('Afghanistan', 'AF', 'Symbolic grouping for UTC+04:30', true), country('Kazakhstan', 'KZ', 'Western regions', true), country('Maldives', 'MV'), country('Pakistan', 'PK'), country('Uzbekistan', 'UZ')]),
  makeZone(6, [country('Bangladesh', 'BD'), country('Bhutan', 'BT'), country('Kazakhstan', 'KZ', 'Central regions', true), country('Kyrgyzstan', 'KG')]),
  makeZone(7, [country('Cambodia', 'KH'), country('Indonesia', 'ID', 'Western regions', true), country('Laos', 'LA'), country('Thailand', 'TH'), country('Vietnam', 'VN')]),
  makeZone(8, [country('Australia', 'AU', 'Western regions', true), country('China', 'CN'), country('Hong Kong', 'HK'), country('Indonesia', 'ID', 'Central regions', true), country('Malaysia', 'MY'), country('Philippines', 'PH'), country('Singapore', 'SG'), country('Taiwan', 'TW')]),
  makeZone(9, [country('Japan', 'JP'), country('North Korea', 'KP'), country('South Korea', 'KR'), country('Indonesia', 'ID', 'Eastern regions', true)]),
  makeZone(10, [country('Australia', 'AU', 'Eastern regions', true), country('Guam', 'GU'), country('Micronesia', 'FM', 'Parts', true), country('Papua New Guinea', 'PG', 'Parts', true), country('Russia', 'RU', 'Far East regions', true)]),
  makeZone(11, [country('Australia', 'AU', 'Lord Howe/Norfolk region', true), country('New Caledonia', 'NC'), country('Solomon Islands', 'SB'), country('Vanuatu', 'VU')]),
  makeZone(12, [country('Fiji', 'FJ'), country('Kiribati', 'KI', 'Gilbert Islands', true), country('Marshall Islands', 'MH'), country('Nauru', 'NR'), country('New Zealand', 'NZ', 'Parts', true), country('Tuvalu', 'TV')]),
];

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
