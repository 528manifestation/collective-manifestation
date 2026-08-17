import { describe, expect, it } from 'vitest';

import {
  getMemberAuthRuntimeCopy,
  getSupabaseMemberSession,
  signInMemberWithSupabase,
  signOutMemberWithSupabase,
  signUpMemberWithSupabase,
} from './supabaseAuth';

type FakeUser = {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
};

type FakeSession = {
  user: FakeUser;
};

function createFakeClient(options: {
  signUpUser?: FakeUser | null;
  signInSession?: FakeSession | null;
  currentSession?: FakeSession | null;
  signUpError?: string;
  profileError?: string;
  loginError?: string;
  signOutError?: string;
  sessionError?: string;
} = {}) {
  const calls: Record<string, unknown[]> = {
    signUp: [],
    profileInsert: [],
    signInWithPassword: [],
    signOut: [],
    getSession: [],
  };

  const client = {
    auth: {
      signUp: async (payload: unknown) => {
        calls.signUp.push(payload);
        return {
          data: { user: options.signUpUser ?? { id: 'user-123', email: 'member@example.com' } },
          error: options.signUpError ? { message: options.signUpError } : null,
        };
      },
      signInWithPassword: async (payload: unknown) => {
        calls.signInWithPassword.push(payload);
        return {
          data: {
            session:
              options.signInSession ??
              ({
                user: {
                  id: 'user-123',
                  email: 'member@example.com',
                  user_metadata: { username: 'manifest_member' },
                },
              } satisfies FakeSession),
          },
          error: options.loginError ? { message: options.loginError } : null,
        };
      },
      signOut: async () => {
        calls.signOut.push({});
        return { error: options.signOutError ? { message: options.signOutError } : null };
      },
      getSession: async () => {
        calls.getSession.push({});
        return {
          data: { session: options.currentSession ?? null },
          error: options.sessionError ? { message: options.sessionError } : null,
        };
      },
    },
    from: (table: string) => ({
      insert: async (rows: unknown[]) => {
        calls.profileInsert.push({ table, rows });
        return { error: options.profileError ? { message: options.profileError } : null };
      },
    }),
  };

  return { client, calls };
}

describe('Supabase member auth service', () => {
  it('describes whether the member UI should use local preview or real Supabase Auth', () => {
    expect(getMemberAuthRuntimeCopy(false)).toEqual({
      modeLabel: 'Local preview mode',
      idleStatus: 'Local preview only — passwords are not saved and Supabase Auth is not called yet.',
      signupButton: 'Preview member signup',
      loginButton: 'Preview member login',
    });

    expect(getMemberAuthRuntimeCopy(true)).toEqual({
      modeLabel: 'Supabase Auth mode',
      idleStatus: 'Supabase Auth is configured — signup and login will create real authenticated sessions.',
      signupButton: 'Create member account',
      loginButton: 'Log in securely',
    });
  });

  it('keeps signup disabled when Supabase is not configured', async () => {
    const result = await signUpMemberWithSupabase(null, {
      username: 'manifest_member',
      email: 'member@example.com',
      password: 'ManifestWave528',
      confirmPassword: 'ManifestWave528',
    });

    expect(result).toEqual({ ok: false, error: 'Supabase is not configured yet.' });
  });

  it('signs up with Supabase Auth and creates a profile row without storing the password', async () => {
    const { client, calls } = createFakeClient();

    const result = await signUpMemberWithSupabase(client, {
      username: ' Manifest_Member ',
      email: 'MEMBER@EXAMPLE.COM ',
      password: 'ManifestWave528',
      confirmPassword: 'ManifestWave528',
    });

    expect(result).toMatchObject({
      ok: true,
      session: {
        id: 'user-123',
        username: 'manifest_member',
        email: 'member@example.com',
        role: 'member',
        source: 'supabase-auth',
      },
    });
    expect(result).not.toHaveProperty('password');
    expect(calls.signUp[0]).toEqual({
      email: 'member@example.com',
      password: 'ManifestWave528',
      options: { data: { username: 'manifest_member' } },
    });
    expect(calls.profileInsert[0]).toEqual({
      table: 'profiles',
      rows: [
        {
          id: 'user-123',
          username: 'manifest_member',
          display_name: 'manifest_member',
          role: 'member',
        },
      ],
    });
  });

  it('logs in with Supabase Auth and maps the returned session to a member session', async () => {
    const { client, calls } = createFakeClient();

    const result = await signInMemberWithSupabase(client, {
      email: 'MEMBER@EXAMPLE.COM ',
      password: 'ManifestWave528',
    });

    expect(result).toMatchObject({
      ok: true,
      session: {
        id: 'user-123',
        username: 'manifest_member',
        email: 'member@example.com',
        role: 'member',
        source: 'supabase-auth',
      },
    });
    expect(result).not.toHaveProperty('password');
    expect(calls.signInWithPassword[0]).toEqual({
      email: 'member@example.com',
      password: 'ManifestWave528',
    });
  });

  it('returns null when there is no active Supabase session', async () => {
    const { client } = createFakeClient({ currentSession: null });

    await expect(getSupabaseMemberSession(client)).resolves.toEqual({ ok: true, session: null });
  });

  it('signs out through Supabase Auth', async () => {
    const { client, calls } = createFakeClient();

    await expect(signOutMemberWithSupabase(client)).resolves.toEqual({ ok: true });
    expect(calls.signOut).toHaveLength(1);
  });
});
