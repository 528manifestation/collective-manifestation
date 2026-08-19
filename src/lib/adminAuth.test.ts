import { describe, expect, it } from 'vitest';

import { checkAdminAccess } from './adminAuth';

type FakeProfileRow = {
  username: string;
  role: 'member' | 'moderator' | 'admin';
};

function createProfileClient(options: { row?: FakeProfileRow | null; error?: string } = {}) {
  const calls: unknown[] = [];
  const client = {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: string) => ({
          maybeSingle: async () => {
            calls.push({ table, columns, column, value });
            return {
              data: options.row ?? null,
              error: options.error ? { message: options.error } : null,
            };
          },
        }),
      }),
    }),
  };

  return { client, calls };
}

describe('admin auth helper', () => {
  it('returns admin access only when the profile role is admin', async () => {
    const { client, calls } = createProfileClient({ row: { username: 'admin_rick', role: 'admin' } });

    await expect(checkAdminAccess(client, 'user-123')).resolves.toEqual({
      ok: true,
      isAdmin: true,
      profile: { username: 'admin_rick', role: 'admin' },
    });

    expect(calls[0]).toEqual({
      table: 'profiles',
      columns: 'username, role',
      column: 'id',
      value: 'user-123',
    });
  });

  it('does not grant admin access to member profiles', async () => {
    const { client } = createProfileClient({ row: { username: 'manifest_member', role: 'member' } });

    await expect(checkAdminAccess(client, 'user-456')).resolves.toEqual({
      ok: true,
      isAdmin: false,
      profile: { username: 'manifest_member', role: 'member' },
    });
  });

  it('does not grant admin access when there is no profile row', async () => {
    const { client } = createProfileClient({ row: null });

    await expect(checkAdminAccess(client, 'user-789')).resolves.toEqual({
      ok: true,
      isAdmin: false,
      profile: null,
    });
  });

  it('returns an error when the profile lookup fails', async () => {
    const { client } = createProfileClient({ error: 'RLS rejected profile lookup' });

    await expect(checkAdminAccess(client, 'user-999')).resolves.toEqual({
      ok: false,
      isAdmin: false,
      error: 'RLS rejected profile lookup',
    });
  });

  it('keeps admin checks disabled without a client or user id', async () => {
    await expect(checkAdminAccess(null, 'user-123')).resolves.toEqual({
      ok: true,
      isAdmin: false,
      profile: null,
    });
    await expect(checkAdminAccess(createProfileClient().client, '')).resolves.toEqual({
      ok: true,
      isAdmin: false,
      profile: null,
    });
  });
});
