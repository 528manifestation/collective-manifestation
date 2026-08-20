import { describe, expect, it } from 'vitest';

import { memberDashboardCopy } from './memberDashboardCopy';

describe('member dashboard copy', () => {
  it('uses a plain sign-out label for real and preview sessions', () => {
    expect(memberDashboardCopy.signOutButton).toBe('Sign out');
  });
});
