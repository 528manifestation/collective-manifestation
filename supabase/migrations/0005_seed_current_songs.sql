-- Seed current public song metadata for admin management.
-- Audio/artwork files live in public/assets and remain versioned separately.

insert into public.songs (
  slug,
  title,
  track_number,
  audio_path,
  artwork_path,
  lyrics,
  description,
  is_published,
  is_theme_song
)
values
  (
    'collective-manifestation-theme-song',
    'Collective Manifestation Theme Song',
    1,
    '/assets/music/Collective%20Manifestation%20Theme%20Song.mp3',
    '/assets/artwork/CollectiveManifestation.webp',
    '',
    'Official Collective Manifestation theme song.',
    true,
    true
  ),
  (
    'vivid-rise',
    'Vivid Rise',
    2,
    '/assets/music/vivid-rise.mp3',
    '/assets/artwork/Vivid%20Rise.webp',
    '',
    '',
    true,
    false
  ),
  (
    'the-awakening',
    'The Awakening',
    3,
    '/assets/music/the-awakening.mp3',
    '/assets/artwork/The%20Awakening.webp',
    '',
    '',
    true,
    false
  ),
  (
    'flow',
    'Flow',
    4,
    '/assets/music/flow.mp3',
    '/assets/artwork/Flow.webp',
    '',
    '',
    true,
    false
  ),
  (
    'global-song',
    'Global Song',
    5,
    '/assets/music/global-song.mp3',
    '/assets/artwork/Global%20Song.webp',
    '',
    '',
    true,
    false
  ),
  (
    'unity',
    'Unity',
    6,
    '/assets/music/unity.mp3',
    '/assets/artwork/Unity.webp',
    '',
    '',
    true,
    false
  ),
  (
    'wave',
    'Wave',
    7,
    '/assets/music/wave.mp3',
    '/assets/artwork/Wave.webp',
    '',
    '',
    true,
    false
  ),
  (
    'the-unity',
    'The Unity',
    8,
    '/assets/music/the-unity.mp3',
    '/assets/artwork/The%20Unity.webp',
    '',
    '',
    true,
    false
  ),
  (
    'the-rising-tide',
    'The Rising Tide',
    9,
    '/assets/music/the-rising-tide.mp3',
    '/assets/artwork/The%20Rising%20Tide.webp',
    '',
    '',
    true,
    false
  ),
  (
    'vibe',
    'Vibe',
    10,
    '/assets/music/vibe.mp3',
    '/assets/artwork/vibe.webp',
    '',
    '',
    true,
    false
  )
on conflict (slug) do update
set
  title = excluded.title,
  track_number = excluded.track_number,
  audio_path = excluded.audio_path,
  artwork_path = excluded.artwork_path,
  lyrics = excluded.lyrics,
  description = excluded.description,
  is_published = excluded.is_published,
  is_theme_song = excluded.is_theme_song,
  updated_at = now();

notify pgrst, 'reload schema';
