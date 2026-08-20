import { getCurrentManifestWaveSlot } from './manifestwave';

export type WaveParticipationActionType = 'started_ritual' | 'completed_ritual';

type SupabaseError = {
  message: string;
};

type SupabaseSessionUserLike = {
  id: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseSessionLike = {
  user: SupabaseSessionUserLike;
};

type ProfileCountryRow = {
  country: string | null;
};

type ProfileCountryQuery = {
  eq(column: string, value: string): {
    single(): PromiseLike<{ data: ProfileCountryRow | null; error: SupabaseError | null }>;
  };
};

type ProfilesTableLike = {
  select(columns: string): ProfileCountryQuery;
};

type WaveEventsTableLike = {
  select(columns: string): {
    order(column: string, options: { ascending: boolean }): PromiseLike<{
      data: WaveParticipationEventRow[] | null;
      error: SupabaseError | null;
    }>;
  };
  insert(rows: WaveParticipationPayload[]): PromiseLike<{ error: SupabaseError | null }>;
};

export type WaveParticipationClientLike = {
  auth: {
    getSession(): PromiseLike<{ data: { session: SupabaseSessionLike | null }; error: SupabaseError | null }>;
  };
  from(table: 'profiles'): ProfilesTableLike;
  from(table: 'wave_participation_events'): WaveEventsTableLike;
};

export type WaveParticipationPayload = {
  member_id: string;
  country: string;
  browser_timezone: string;
  utc_offset_minutes_at_event: number;
  active_manifestwave_slot: number;
  ritual_action_type: WaveParticipationActionType;
  client_reported_at: string;
};

export type WaveParticipationEventRow = {
  id: string;
  country: string | null;
  browser_timezone: string | null;
  active_manifestwave_slot: number;
  ritual_action_type: WaveParticipationActionType;
  client_reported_at: string;
  created_at: string;
};

export type WaveStatsBucket = {
  label: string;
  count: number;
};

export type WaveParticipationStats = {
  totalEvents: number;
  startedCount: number;
  completedCount: number;
  byCountry: WaveStatsBucket[];
  byTimezone: WaveStatsBucket[];
  bySlot: WaveStatsBucket[];
  recentEvents: WaveParticipationEventRow[];
};

export type WaveParticipationResult =
  | { ok: true; activeManifestWaveSlot: number }
  | { ok: false; error: string };

export type WaveParticipationStatsResult =
  | { ok: true; stats: WaveParticipationStats }
  | { ok: false; error: string };

export type WaveParticipationRuntime = {
  date?: Date;
  browserTimezone?: string;
  utcOffsetMinutes?: number;
};

function getErrorMessage(error: SupabaseError | null, fallback: string): string {
  return error?.message || fallback;
}

function normalizeCountry(country: string): string {
  return country.trim().replace(/\s+/g, ' ');
}

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function getMetadataCountry(user: SupabaseSessionUserLike): string {
  const country = user.user_metadata?.country;
  return typeof country === 'string' ? normalizeCountry(country) : '';
}

function slotLabel(slot: number): string {
  return `UTC${slot >= 0 ? '+' : ''}${slot}`;
}

function countBy(rows: WaveParticipationEventRow[], getLabel: (row: WaveParticipationEventRow) => string): WaveStatsBucket[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const label = getLabel(row).trim() || 'Unknown';
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label));
}

export function summarizeWaveParticipationEvents(rows: WaveParticipationEventRow[]): WaveParticipationStats {
  const recentEvents = [...rows]
    .sort((first, second) => Date.parse(second.created_at) - Date.parse(first.created_at))
    .slice(0, 10);

  return {
    totalEvents: rows.length,
    startedCount: rows.filter((row) => row.ritual_action_type === 'started_ritual').length,
    completedCount: rows.filter((row) => row.ritual_action_type === 'completed_ritual').length,
    byCountry: countBy(rows, (row) => row.country || 'Unknown'),
    byTimezone: countBy(rows, (row) => row.browser_timezone || 'Unknown'),
    bySlot: countBy(rows, (row) => slotLabel(row.active_manifestwave_slot)),
    recentEvents,
  };
}

export function buildWaveParticipationPayload(input: {
  memberId: string;
  country: string;
  actionType: WaveParticipationActionType;
  date?: Date;
  browserTimezone?: string;
  utcOffsetMinutes?: number;
}): WaveParticipationPayload {
  const date = input.date || new Date();
  const browserTimezone = input.browserTimezone || getBrowserTimezone();
  const utcOffsetMinutes = input.utcOffsetMinutes ?? -date.getTimezoneOffset();

  return {
    member_id: input.memberId,
    country: normalizeCountry(input.country),
    browser_timezone: browserTimezone,
    utc_offset_minutes_at_event: utcOffsetMinutes,
    active_manifestwave_slot: getCurrentManifestWaveSlot(date),
    ritual_action_type: input.actionType,
    client_reported_at: date.toISOString(),
  };
}

export async function recordWaveParticipation(
  client: WaveParticipationClientLike | null,
  actionType: WaveParticipationActionType,
  runtime: WaveParticipationRuntime = {},
): Promise<WaveParticipationResult> {
  if (!client) {
    return { ok: false, error: 'Supabase is not configured yet.' };
  }

  const sessionResult = await client.auth.getSession();
  if (sessionResult.error) {
    return { ok: false, error: getErrorMessage(sessionResult.error, 'Could not read current session.') };
  }

  const user = sessionResult.data.session?.user;
  if (!user) {
    return { ok: false, error: 'Sign in before recording ManifestWave participation.' };
  }

  let country = getMetadataCountry(user);
  const profileResult = await client.from('profiles').select('country').eq('id', user.id).single();
  if (profileResult.data?.country) {
    country = normalizeCountry(profileResult.data.country);
  } else if (profileResult.error && !country) {
    return { ok: false, error: getErrorMessage(profileResult.error, 'Could not load member country.') };
  }

  const payload = buildWaveParticipationPayload({
    memberId: user.id,
    country,
    actionType,
    date: runtime.date,
    browserTimezone: runtime.browserTimezone,
    utcOffsetMinutes: runtime.utcOffsetMinutes,
  });

  const insertResult = await client.from('wave_participation_events').insert([payload]);
  if (insertResult.error) {
    return { ok: false, error: getErrorMessage(insertResult.error, 'Could not record ManifestWave participation.') };
  }

  return { ok: true, activeManifestWaveSlot: payload.active_manifestwave_slot };
}

export async function getWaveParticipationStats(
  client: WaveParticipationClientLike | null,
): Promise<WaveParticipationStatsResult> {
  if (!client) {
    return { ok: false, error: 'Supabase is not configured yet.' };
  }

  const result = await client
    .from('wave_participation_events')
    .select('id, country, browser_timezone, active_manifestwave_slot, ritual_action_type, client_reported_at, created_at')
    .order('created_at', { ascending: false });

  if (result.error) {
    return { ok: false, error: getErrorMessage(result.error, 'Could not load ManifestWave participation stats.') };
  }

  return { ok: true, stats: summarizeWaveParticipationEvents(result.data || []) };
}
