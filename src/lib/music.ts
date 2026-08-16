import songsData from '../data/songs.json';

export type Song = {
  id: string;
  title: string;
  trackNumber: number;
  audioPath: string;
  sourceFilename: string;
  sizeBytes: number;
};

export const songs = songsData as Song[];

export function getTotalMusicSizeBytes(): number {
  return songs.reduce((total, song) => total + song.sizeBytes, 0);
}
