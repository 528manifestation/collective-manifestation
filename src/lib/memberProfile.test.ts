import { describe, expect, it } from 'vitest';

import {
  getMemberProfile,
  initialProfileSettingsForm,
  ProfileRow,
  updateMemberProfile,
  validateProfileSettingsForm,
} from './memberProfile';

function createFakeProfileClient(options: {
  profile?: ProfileRow | null;
  selectError?: string;
  updateError?: string;
} = {}) {
  const calls: Record<string, unknown[]> = {
    from: [],
    select: [],
    eq: [],
    single: [],
    update: [],
  };

  const defaultProfile: ProfileRow = {
    id: 'user-123',
    username: 'manifest_member',
    display_name: 'Manifest Member',
    timezone: 'America/Chicago',
    country: 'United States',
    role: 'member',
  };

  const tableApi = {
    select: (columns: string) => {
      calls.select.push(columns);
      return {
        eq: (column: string, value: string) => {
          calls.eq.push({ column, value });
          return {
            single: async () => {
              calls.single.push({});
              return {
                data: options.profile === undefined ? defaultProfile : options.profile,
                error: options.selectError ? { message: options.selectError } : null,
              };
            },
          };
        },
      };
    },
    update: (payload: { display_name: string; timezone: string; country: string }) => {
      calls.update.push(payload);
      return {
        eq: (column: string, value: string) => {
          calls.eq.push({ column, value });
          return {
            select: (columns: string) => {
              calls.select.push(columns);
              return {
                single: async () => ({
                  data: {
                    id: 'user-123',
                    username: 'manifest_member',
                    display_name: payload.display_name,
                    timezone: payload.timezone,
                    country: payload.country,
                    role: 'member',
                  } satisfies ProfileRow,
                  error: options.updateError ? { message: options.updateError } : null,
                }),
              };
            },
          };
        },
      };
    },
  };

  return {
    calls,
    client: {
      from: (table: string) => {
        calls.from.push(table);
        return tableApi;
      },
    },
  };
}

describe('member profile service', () => {
  it('validates optional profile fields before update', () => {
    expect(validateProfileSettingsForm(initialProfileSettingsForm)).toEqual({ isValid: true, errors: {} });

    expect(
      validateProfileSettingsForm({
        displayName: 'a'.repeat(61),
        timezone: 'b'.repeat(81),
        country: 'c'.repeat(81),
      }),
    ).toEqual({
      isValid: false,
      errors: {
        displayName: 'Display name must be 60 characters or fewer.',
        timezone: 'Timezone must be 80 characters or fewer.',
        country: 'Country must be 80 characters or fewer.',
      },
    });
  });

  it('fetches the signed-in member profile by auth user id', async () => {
    const { client, calls } = createFakeProfileClient();

    const result = await getMemberProfile(client, 'user-123');

    expect(result).toMatchObject({
      ok: true,
      profile: {
        id: 'user-123',
        username: 'manifest_member',
        displayName: 'Manifest Member',
        timezone: 'America/Chicago',
        country: 'United States',
        role: 'member',
      },
    });
    expect(calls.from).toEqual(['profiles']);
    expect(calls.eq).toContainEqual({ column: 'id', value: 'user-123' });
  });

  it('updates only safe profile settings fields scoped to the signed-in member id', async () => {
    const { client, calls } = createFakeProfileClient();

    const result = await updateMemberProfile(client, 'user-123', {
      displayName: '  Rick  ',
      timezone: '  America/New_York ',
      country: ' United States ',
    });

    expect(result).toMatchObject({
      ok: true,
      profile: {
        id: 'user-123',
        username: 'manifest_member',
        displayName: 'Rick',
        timezone: 'America/New_York',
        country: 'United States',
        role: 'member',
      },
    });
    expect(calls.update[0]).toEqual({
      display_name: 'Rick',
      timezone: 'America/New_York',
      country: 'United States',
    });
    expect(calls.update[0]).not.toHaveProperty('id');
    expect(calls.update[0]).not.toHaveProperty('email');
    expect(calls.update[0]).not.toHaveProperty('role');
    expect(calls.eq).toContainEqual({ column: 'id', value: 'user-123' });
  });

  it('refuses profile calls when Supabase is not configured', async () => {
    await expect(getMemberProfile(null, 'user-123')).resolves.toEqual({
      ok: false,
      error: 'Supabase is not configured yet.',
    });

    await expect(updateMemberProfile(null, 'user-123', initialProfileSettingsForm)).resolves.toEqual({
      ok: false,
      error: 'Supabase is not configured yet.',
    });
  });
});
