import { describe, expect, it } from 'vitest';

import {
  createLocalLoginPayload,
  createLocalMemberSession,
  createLocalSignupPayload,
  initialLoginForm,
  initialSignupForm,
  validateLoginForm,
  validateSignupForm,
} from './memberAuth';

describe('member auth form helpers', () => {
  it('requires username, email, strong password, and matching confirmation for signup', () => {
    const result = validateSignupForm(initialSignupForm);

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      username: 'Choose a username.',
      email: 'Enter a valid email address.',
      password: 'Use at least 12 characters with uppercase, lowercase, and a number.',
      confirmPassword: 'Confirm your password.',
    });
  });

  it('rejects unsafe usernames and mismatched signup passwords', () => {
    const result = validateSignupForm({
      username: 'Bad Name!',
      email: 'member@example.com',
      password: 'ManifestWave528',
      confirmPassword: 'ManifestWave529',
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toEqual({
      username: 'Use 3–24 lowercase letters, numbers, or underscores.',
      confirmPassword: 'Passwords do not match.',
    });
  });

  it('accepts and sanitizes a valid signup preview payload without storing the password', () => {
    const payload = createLocalSignupPayload({
      username: ' manifest_member ',
      email: 'MEMBER@EXAMPLE.COM ',
      password: 'ManifestWave528',
      confirmPassword: 'ManifestWave528',
    });

    expect(payload).toMatchObject({
      username: 'manifest_member',
      email: 'member@example.com',
      submissionMode: 'local-preview',
      authProvider: 'supabase-auth',
    });
    expect(payload).not.toHaveProperty('password');
    expect(payload.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('validates login email and password locally', () => {
    expect(validateLoginForm(initialLoginForm)).toEqual({
      isValid: false,
      errors: {
        email: 'Enter your email address.',
        password: 'Enter your password.',
      },
    });

    expect(validateLoginForm({ email: 'member@example.com', password: 'ManifestWave528' })).toEqual({
      isValid: true,
      errors: {},
    });
  });

  it('creates a login preview payload without storing the password', () => {
    const payload = createLocalLoginPayload({
      email: 'MEMBER@EXAMPLE.COM ',
      password: 'ManifestWave528',
    });

    expect(payload).toMatchObject({
      email: 'member@example.com',
      submissionMode: 'local-preview',
      authProvider: 'supabase-auth',
    });
    expect(payload).not.toHaveProperty('password');
  });

  it('creates a local protected-dashboard session from signup without password data', () => {
    const signupPayload = createLocalSignupPayload({
      username: 'manifest_member',
      email: 'member@example.com',
      password: 'ManifestWave528',
      confirmPassword: 'ManifestWave528',
    });

    const session = createLocalMemberSession(signupPayload);

    expect(session).toMatchObject({
      username: 'manifest_member',
      email: 'member@example.com',
      source: 'signup-preview',
      role: 'member',
    });
    expect(session).not.toHaveProperty('password');
    expect(session.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('creates a local protected-dashboard session from login with a username fallback', () => {
    const loginPayload = createLocalLoginPayload({
      email: 'member@example.com',
      password: 'ManifestWave528',
    });

    expect(createLocalMemberSession(loginPayload)).toMatchObject({
      username: 'member',
      email: 'member@example.com',
      source: 'login-preview',
      role: 'member',
    });
  });
});
