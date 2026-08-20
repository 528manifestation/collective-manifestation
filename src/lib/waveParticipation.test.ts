import { describe, expect, it } from 'vitest';

import {
  WaveParticipationClientLike,
  buildWaveParticipationPayload,
  getWaveParticipationStats,
  recordWaveParticipation,
  summarizeWaveParticipationEvents,
} from './waveParticipation';

function createFakeClient(options: {
  sessionUserId?: string | null;
  country?: string | null;
  events?: unknown[];
  sessionError?: string;
  profileError?: string;
  insertError?: string;
  selectError?: string;
} = {}) {
  const calls: Record<string, unknown[]> = {
    getSession: [],
    from: [],
    select: [],
    eq: [],
    single: [],
    insert: [],
    order: [],
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
        select: (columns: string) => {
          calls.select.push({ table, columns });
          return {
            order: async (column: string, orderOptions: { ascending: boolean }) => {
              calls.order.push({ table, column, options: orderOptions });
              return {
                data: options.events || [],
                error: options.selectError ? { message: options.selectError } : null,
              };
            },
          };
        },
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

  it('summarizes participation events for admin dashboard stats', () => {
    const stats = summarizeWaveParticipationEvents([
      {
        id: 'event-1',
        country: 'United States',
        browser_timezone: 'America/New_York',
        active_manifestwave_slot: -5,
        ritual_action_type: 'started_ritual',
        client_reported_at: '2026-08-19T22:28:00.000Z',
        created_at: '2026-08-19T22:28:01.000Z',
      },
      {
        id: 'event-2',
        country: 'United States',
        browser_timezone: 'America/New_York',
        active_manifestwave_slot: -5,
        ritual_action_type: 'started_ritual',
        client_reported_at: '2026-08-19T22:30:00.000Z',
        created_at: '2026-08-19T22:30:01.000Z',
      },
      {
        id: 'event-3',
        country: 'Canada',
        browser_timezone: 'America/Toronto',
        active_manifestwave_slot: -5,
        ritual_action_type: 'completed_ritual',
        client_reported_at: '2026-08-19T22:36:00.000Z',
        created_at: '2026-08-19T22:36:01.000Z',
      },
    ]);

    expect(stats).toEqual({
      totalEvents: 3,
      startedCount: 2,
      completedCount: 1,
      byCountry: [
        { label: 'United States', count: 2 },
        { label: 'Canada', count: 1 },
      ],
      byTimezone: [
        { label: 'America/New_York', count: 2 },
        { label: 'America/Toronto', count: 1 },
      ],
      bySlot: [{ label: 'UTC-5', count: 3 }],
      recentEvents: [
        expect.objectContaining({ id: 'event-3' }),
        expect.objectContaining({ id: 'event-2' }),
        expect.objectContaining({ id: 'event-1' }),
      ],
    });
  });

  it('loads admin dashboard stats from wave participation events', async () => {
    const { client, calls } = createFakeClient({
      events: [
        {
          id: 'event-1',
          country: 'United States',
          browser_timezone: 'America/New_York',
          active_manifestwave_slot: -5,
          ritual_action_type: 'started_ritual',
          client_reported_at: '2026-08-19T22:28:00.000Z',
          created_at: '2026-08-19T22:28:01.000Z',
        },
      ],
    });

    const result = await getWaveParticipationStats(client);

    expect(result).toMatchObject({ ok: true, stats: { totalEvents: 1, startedCount: 1 } });
    expect(calls.select).toContainEqual({
      table: 'wave_participation_events',
      columns: 'id, country, browser_timezone, active_manifestwave_slot, ritual_action_type, client_reported_at, created_at',
    });
    expect(calls.order).toContainEqual({
      table: 'wave_participation_events',
      column: 'created_at',
      options: { ascending: false },
    });
  });
});
