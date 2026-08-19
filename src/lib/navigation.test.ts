import { describe, expect, it } from 'vitest';

import { navigationItems } from './navigation';

describe('site navigation', () => {
  it('uses an explicit member sign-in/signup call to action that links to the auth panel', () => {
    expect(navigationItems).toContainEqual({
      label: 'Members sign in / new members sign up',
      href: '#member-auth',
    });
  });

  it('does not hide account access behind a generic Members link', () => {
    expect(navigationItems.map((item) => item.label)).not.toContain('Members');
  });
});
