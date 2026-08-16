import { describe, expect, it } from 'vitest';

import { getTotalMusicSizeBytes, songs } from './music';

describe('music data', () => {
  it('loads the 9 source MP3 tracks copied into public assets', () => {
    expect(songs).toHaveLength(9);
    expect(songs.map((song) => song.title)).toContain('Global Song');
    expect(songs.every((song) => song.audioPath.startsWith('/assets/music/'))).toBe(true);
    expect(getTotalMusicSizeBytes()).toBeGreaterThan(29 * 1024 * 1024);
  });
});
