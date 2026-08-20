import { describe, expect, it } from 'vitest';

import {
  WaveParticipationClientLike,
  buildWaveParticipationPayload,
  recordWaveParticipation,
} from './waveParticipation';

function createFakeClient(options: {
  sessionUserId?: string | null;
  country?: string | null;
  sessionError?: string;
  profileError?: string;
  insertError?: string;
} = {}) {
  const calls: Record<string, unknown[]> = {
    getSession: [],
    from: [],
    select: [],
    eq: [],
    single: [],
    insert: [],
  };

  const client = {
    auth: {
      getSession: async () => {
        calls.getSession.push({});
        return {
          data: {
            session:
              options.sessionUserId === null
                ? null
                : {
                    user: {
                      id: options.sessionUserId || 'user-123',
                      user_metadata: { country: 'Metadata Country' },
                    },
                  },
          },
          error: options.sessionError ? { message: options.sessionError } : null,
        };
      },
    },
    from: (table: 'profiles' | 'wave_participation_events') => {
      calls.from.push(table);
      if (table === 'profiles') {
        return {
          select: (columns: string) => {
            calls.select.push({ table, columns });
            return {
              eq: (column: string, value: string) => {
                calls.eq.push({ table, column, value });
                return {
                  single: async () => {
                    calls.single.push({ table });
                    return {
                      data: { country: options.country === undefined ? 'United States' : options.country },
                      error: options.profileError ? { message: options.profileError } : null,
                    };
                  },
                };
              },
            };
          },
        };
      }

      return {
        insert: async (rows: unknown[]) => {
          calls.insert.push({ table, rows });
          return { error: options.insertError ? { message: options.insertError } : null };
        },
      };
    },
  } as unknown as WaveParticipationClientLike;

  return { client, calls };
}

describe('wave participation analytics', () => {
  it('builds a normalized event payload with active wave slot and client timezone context', () => {
    const date = new Date('2026-08-19T22:28:00Z');

    const payload = buildWaveParticipationPayload({
      memberId: 'user-123',
      country: ' United   States ',
      actionType: 'started_ritual',
      date,
      browserTimezone: 'America/New_York',
      utcOffsetMinutes: -240,
    });

    expect(payload).toEqual({
      member_id: 'user-123',
      country: 'United States',
      browser_timezone: 'America/New_York',
      utc_offset_minutes_at_event: -240,
      active_manifestwave_slot: -5,
      ritual_action_type: 'started_ritual',
      client_reported_at: '2026-08-19T22:28:00.000Z',
    });
  });

  it('records a signed-in member ritual event using profile country when available', async () => {
    const { client, calls } = createFakeClient({ country: 'Canada' });

    const result = await recordWaveParticipation(client, 'completed_ritual', {
      date: new Date('2026-08-19T22:33:00Z'),
      browserTimezone: 'America/Toronto',
      utcOffsetMinutes: -240,
    });

    expect(result).toEqual({ ok: true, activeManifestWaveSlot: -5 });
    expect(calls.eq).toContainEqual({ table: 'profiles', column: 'id', value: 'user-123' });
    expect(calls.insert[0]).toEqual({
      table: 'wave_participation_events',
      rows: [
        {
          member_id: 'user-123',
          country: 'Canada',
          browser_timezone: 'America/Toronto',
          utc_offset_minutes_at_event: -240,
          active_manifestwave_slot: -5,
          ritual_action_type: 'completed_ritual',
          client_reported_at: '2026-08-19T22:33:00.000Z',
        },
      ],
    });
  });

  it('requires a signed-in Supabase session before recording participation', async () => {
    const { client, calls } = createFakeClient({ sessionUserId: null });

    await expect(recordWaveParticipation(client, 'started_ritual')).resolves.toEqual({
      ok: false,
      error: 'Sign in before recording ManifestWave participation.',
    });
    expect(calls.insert).toHaveLength(0);
  });

  it('falls back to auth metadata country if profile country is unavailable', async () => {
    const { client, calls } = createFakeClient({ country: null });

    const result = await recordWaveParticipation(client, 'started_ritual', {
      date: new Date('2026-08-19T22:28:00Z'),
      browserTimezone: 'America/New_York',
      utcOffsetMinutes: -240,
    });

    expect(result).toEqual({ ok: true, activeManifestWaveSlot: -5 });
    expect(calls.insert[0]).toMatchObject({
      rows: [
        expect.objectContaining({
          country: 'Metadata Country',
        }),
      ],
    });
  });
});
