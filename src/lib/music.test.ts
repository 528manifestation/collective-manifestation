import { describe, expect, it } from 'vitest';

import { getTotalMusicSizeBytes, songs } from './music';

describe('music data', () => {
  it('loads the 10 source MP3 tracks in the source-document order with the theme song first', () => {
    expect(songs).toHaveLength(10);
    expect(songs.map((song) => song.title)).toEqual([
      'Collective Manifestation Theme Song',
      'Vivid Rise',
      'The Awakening',
      'Flow',
      'Global Song',
      'Unity',
      'Wave',
      'The Unity',
      'The Rising Tide',
      'Vibe',
    ]);
    expect(songs.every((song) => song.audioPath.startsWith('/assets/music/'))).toBe(true);
    expect(songs.every((song) => song.artworkPath.startsWith('/assets/artworkformusiv/'))).toBe(true);
    expect(songs[0]).toMatchObject({ isThemeSong: true, trackNumber: 1 });
    expect(getTotalMusicSizeBytes()).toBeGreaterThan(32 * 1024 * 1024);
  });
});
