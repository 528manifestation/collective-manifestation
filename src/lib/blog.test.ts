import { describe, expect, it } from 'vitest';

import { BlogPost, calculateReadTimeMinutes, getPublishedBlogPosts } from './blog';

const posts: BlogPost[] = [
  {
    id: 'draft',
    slug: 'draft-post',
    title: 'Draft Post',
    excerpt: 'Hidden draft.',
    body: 'Draft body.',
    status: 'draft',
    publishedAt: null,
    readTimeMinutes: 1,
  },
  {
    id: 'older',
    slug: 'older-post',
    title: 'Older Published Post',
    excerpt: 'Older published excerpt.',
    body: 'Older body.',
    status: 'published',
    publishedAt: '2026-08-01T12:00:00.000Z',
    readTimeMinutes: 2,
  },
  {
    id: 'newer',
    slug: 'newer-post',
    title: 'Newer Published Post',
    excerpt: 'Newer published excerpt.',
    body: 'Newer body.',
    status: 'published',
    publishedAt: '2026-08-10T12:00:00.000Z',
    readTimeMinutes: 3,
  },
];

describe('blog helpers', () => {
  it('shows only published blog posts sorted newest first', () => {
    expect(getPublishedBlogPosts(posts).map((post) => post.slug)).toEqual(['newer-post', 'older-post']);
  });

  it('calculates a minimum one-minute reading time', () => {
    expect(calculateReadTimeMinutes('short post')).toBe(1);
  });

  it('rounds longer reading time based on 220 words per minute', () => {
    const body = Array.from({ length: 441 }, (_, index) => `word${index}`).join(' ');
    expect(calculateReadTimeMinutes(body)).toBe(3);
  });
});
