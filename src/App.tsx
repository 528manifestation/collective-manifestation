import { useEffect, useMemo, useState } from 'react';

import { BlogSection } from './components/BlogSection';
import { ContactWaitlistForm } from './components/ContactWaitlistForm';
import { MemberAuthPanel } from './components/MemberAuthPanel';
import {
  getCurrentManifestWaveSlot,
  getSlotCardPath,
  getZoneBySlot,
  manifestwaveZones,
} from './lib/manifestwave';
import { getManifestCallAlertState } from './lib/manifestCall';
import {
  extractLyricsForTrack,
  fetchPublishedSongs,
  getTotalMusicSizeBytes,
  MASTER_LYRICS_PATH,
  Song,
  SongsClientLike,
  songs,
} from './lib/music';
import { navigationItems } from './lib/navigation';
import { isSupabaseConfigured, supabase } from './lib/supabase';

function App() {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const activeSlot = getCurrentManifestWaveSlot(currentTime);
  const activeZone = getZoneBySlot(activeSlot);
  const alertState = getManifestCallAlertState(currentTime);
  const [musicLibrary, setMusicLibrary] = useState(songs);
  const [musicSource, setMusicSource] = useState<'local' | 'supabase'>('local');
  const [selectedSongId, setSelectedSongId] = useState(songs[0]?.id || '');
  const [selectedLyrics, setSelectedLyrics] = useState('Select a song to view lyrics.');
  const totalMusicSizeMb = (getTotalMusicSizeBytes(musicLibrary) / 1024 / 1024).toFixed(1);
  const selectedSong = musicLibrary.find((song) => song.id === selectedSongId) || musicLibrary[0];
  const featuredZones = useMemo(
    () => [activeZone, getZoneBySlot(-5), getZoneBySlot(1), getZoneBySlot(10)].filter(
      (zone, index, zones) => zones.findIndex((item) => item.slot === zone.slot) === index,
    ),
    [activeZone],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSongs() {
      const result = await fetchPublishedSongs(supabase as SongsClientLike | null);
      if (!isMounted) {
        return;
      }

      setMusicLibrary(result.songs);
      setMusicSource(result.source);
      if (result.songs.length) {
        setSelectedSongId((currentId) => (result.songs.some((song) => song.id === currentId) ? currentId : result.songs[0].id));
      }
    }

    void loadSongs();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLyrics(song: Song) {
      setSelectedLyrics(`Loading lyrics for ${song.title}…`);

      try {
        const response = await fetch(MASTER_LYRICS_PATH);
        if (!response.ok) {
          throw new Error(`Lyrics request failed with ${response.status}`);
        }

        const masterLyrics = await response.text();
        if (isMounted) {
          setSelectedLyrics(extractLyricsForTrack(masterLyrics, song.trackNumber, song.title));
        }
      } catch {
        if (isMounted) {
          setSelectedLyrics(`${song.title}\n\nLyrics are not available yet.`);
        }
      }
    }

    if (selectedSong) {
      void loadLyrics(selectedSong);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedSong]);

  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Collective Manifestation home">
            <img
              src="/assets/brand/collective-manifestation-logo.png"
              alt=""
              aria-hidden="true"
            />
            <span>Collective Manifestation</span>
          </a>
          <div className="nav-links">
            {navigationItems.map((item) => (
              <a className={item.href === '#member-auth' ? 'nav-account-link' : undefined} key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">ManifestWave 528</p>
            <h1>A 24-hour global wave of focused intention.</h1>
            <p className="lede">
              A calm public home for the daily 5:28 Manifest Call: five focused minutes of
              shared intention, kindness, and hope moving through the world one time zone at a time.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#manifestwave">
                View today&apos;s wave
              </a>
              <a className="button secondary" href="#music">
                Explore the music
              </a>
            </div>
            <div className="video-placeholder" aria-label="Welcome video placeholder">
              <span>Welcome video</span>
              <strong>Feel the shift. Join the wave. Change the world.</strong>
              <p>
                The final welcome video will explain the practice, the 528 rhythm, and how visitors can
                join without needing meditation experience.
              </p>
            </div>
          </div>

          <aside className="now-card" aria-labelledby="current-wave-title">
            <p className="eyebrow">Current 5 PM wave zone</p>
            <h2 id="current-wave-title">{activeZone.label}</h2>
            <p>5:00 PM – 5:59 PM local wave window</p>
            <strong>5:28 PM Manifest Call</strong>
            <div className={alertState.isActive ? 'call-alert is-active' : 'call-alert'}>
              {alertState.isActive
                ? 'Please start the Intention for Manifestation video now.'
                : `Next 5:28 call in about ${alertState.minutesUntilNextCall} minutes.`}
            </div>
            <img src={getSlotCardPath(activeZone.slot)} alt={`${activeZone.label} ManifestWave card`} />
          </aside>
        </div>
      </section>

      <section className="section intro" id="manifestwave">
        <div>
          <p className="eyebrow">ManifestWave tracker</p>
          <h2>Every hour, another region carries the intention.</h2>
        </div>
        <p>
          The ManifestWave follows the hour where local time is 5:00–5:59 PM. At 5:28 PM,
          visitors can start the guided intention video and carry the same message with their region.
          If they miss their local call, they can join any hour at 28 minutes past — it is always
          5:28 somewhere.
        </p>
      </section>

      <section className="section intention-section" aria-labelledby="intention-title">
        <div>
          <p className="eyebrow">Setting of intentions</p>
          <h2 id="intention-title">A five-minute practice visitors can follow from anywhere.</h2>
          <p>
            This section will hold the guided intention video. The site will flash the Manifest Call
            prompt during minutes 28–37 of every hour, then return to the calmer tracker state.
          </p>
        </div>
        <div className="video-placeholder large" aria-label="Setting of Intentions video placeholder">
          <span>Guided video placeholder</span>
          <strong>Start the Intention for Manifestation video at 5:28.</strong>
          <p>Final video, transcript, and accessibility captions will be added before public launch.</p>
        </div>
      </section>

      <section className="zone-feature-grid" aria-label="Featured ManifestWave zones">
        {featuredZones.map((zone) => (
          <article className="zone-feature" key={zone.slot}>
            <img src={getSlotCardPath(zone.slot)} alt={`${zone.label} card preview`} />
            <div>
              <h3>{zone.label}</h3>
              <p>{zone.countries.length} countries/regions in the cleaned ManifestWave dataset.</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section cards-section">
        <div>
          <p className="eyebrow">24 symbolic cards</p>
          <h2>Country-name + flag cards make the wave easy to scan.</h2>
        </div>
        <div className="card-gallery">
          {manifestwaveZones.map((zone) => (
            <article className="mini-card" key={zone.slot}>
              <img src={getSlotCardPath(zone.slot)} alt={`${zone.label} ManifestWave card`} />
              <div>
                <h3>{zone.label}</h3>
                <details>
                  <summary>Country text</summary>
                  <ul>
                    {zone.countries.map((country) => (
                      <li key={`${zone.slot}-${country.isoAlpha2}-${country.name}`}>
                        <span>{country.name}</span>
                        {country.detail ? <small>{country.detail}</small> : null}
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section split" id="music">
        <div>
          <p className="eyebrow">Original music</p>
          <h2>Original music library</h2>
          <p>
            The first music pass gives visitors a real preview of the project&apos;s original sound.
            Supabase can hold editable song metadata, lyrics, artwork paths, and publish status with local assets as a safe fallback.
          </p>
          <div className="song-list" aria-label="Original music tracks">
            {musicLibrary.map((song) => (
              <article
                className={song.id === selectedSong?.id ? 'song-card selected-song-card' : song.isThemeSong ? 'song-card theme-song-card' : 'song-card'}
                key={song.id}
                onClick={() => setSelectedSongId(song.id)}
              >
                <img className="song-artwork" src={song.artworkPath} alt={`${song.title} artwork`} loading="lazy" />
                <div className="song-details">
                  <span>{song.isThemeSong ? 'Theme Song' : `Track ${song.trackNumber}`}</span>
                  {song.isThemeSong ? <em>Official Theme Song</em> : null}
                  <strong>{song.title}</strong>
                </div>
                <audio controls preload="none" src={song.audioPath} onPlay={() => setSelectedSongId(song.id)}>
                  <a href={song.audioPath}>Download {song.title}</a>
                </audio>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <strong>Supabase status</strong>
          <p>{isSupabaseConfigured ? 'Configured via Vite environment variables.' : 'Ready for env vars; not connected yet.'}</p>
          <p>
            {musicLibrary.length} {musicSource === 'supabase' ? 'published Supabase' : 'local'} tracks available
            {musicSource === 'local' ? ` (${totalMusicSizeMb} MB total).` : '.'}
          </p>
          <div className="lyrics-sidebar" aria-live="polite">
            <span>Lyrics</span>
            <h3>{selectedSong?.title || 'Select a song'}</h3>
            <pre>{selectedLyrics}</pre>
          </div>
        </div>
      </section>

      <section className="section split" id="members">
        <div>
          <p className="eyebrow">Members</p>
          <h2>Member signup will be protected by Supabase Auth.</h2>
          <p>
            The launch version will let members create a username, sign in with email and password, and
            access member-only areas such as music downloads, profile settings, and community features.
          </p>
          <div className="member-feature-grid" aria-label="Planned member features">
            <article>
              <h3>Username profile</h3>
              <p>Public-facing member identity without exposing private email addresses.</p>
            </article>
            <article>
              <h3>Protected content</h3>
              <p>Member-only dashboard space for downloads, check-ins, and future community tools.</p>
            </article>
          </div>
        </div>
        <div className="panel" id="member-auth">
          <strong>Members sign in / new members sign up</strong>
          <p>
            Existing members can sign in here. New members can create a Supabase Auth account with
            a username, email, country, and password.
          </p>
          <MemberAuthPanel />
        </div>
      </section>

      <BlogSection />

      <section className="section split" id="about">
        <div>
          <p className="eyebrow">About</p>
          <h2>A simple daily rhythm for kindness, unity, and focused intention.</h2>
          <p>
            Collective Manifestation is built around one practical invitation: pause for a few minutes,
            set a clear intention for a better world, then return to the day with a lighter heart and an
            eye out for opportunities to be kind.
          </p>
          <div className="faq-grid" aria-label="Frequently asked questions">
            <article>
              <h3>What if I miss 5:28?</h3>
              <p>Join at 28 minutes past any hour. The wave is designed to keep moving around the world.</p>
            </article>
            <article>
              <h3>Do I need experience?</h3>
              <p>No. The guided video will keep the practice simple and accessible for first-time visitors.</p>
            </article>
            <article>
              <h3>Which 5:28?</h3>
              <p>The primary call is 5:28 PM in your local zone, with flexible hourly participation.</p>
            </article>
          </div>
        </div>
        <div className="panel" id="contact">
          <strong>Contact / waitlist</strong>
          <p>
            This local form is ready for launch-review feedback, volunteer interest, and early updates.
            It validates in the browser now; the real Supabase submission stays off until the database is approved.
          </p>
          <ContactWaitlistForm />
        </div>
      </section>

      <section className="section support" id="support">
        <p className="eyebrow">Support</p>
        <h2>Support links will stay parked until the payment path and public accounting copy are ready.</h2>
        <div className="support-grid" aria-label="Future support options">
          {['$10', '$25', '$50', '$100'].map((amount) => (
            <article className="support-tier" key={amount}>
              <span>{amount}</span>
              <p>Future donation tier placeholder</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
