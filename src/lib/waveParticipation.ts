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

export type WaveParticipationResult =
  | { ok: true; activeManifestWaveSlot: number }
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
