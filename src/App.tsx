import { useMemo } from 'react';

import {
  getCurrentManifestWaveSlot,
  getSlotCardPath,
  getZoneBySlot,
  manifestwaveZones,
} from './lib/manifestwave';
import { isSupabaseConfigured } from './lib/supabase';

const navigation = ['ManifestWave', 'Music', 'About', 'Contact', 'Support'];

function App() {
  const activeSlot = getCurrentManifestWaveSlot();
  const activeZone = getZoneBySlot(activeSlot);
  const featuredZones = useMemo(
    () => [activeZone, getZoneBySlot(-5), getZoneBySlot(1), getZoneBySlot(10)].filter(
      (zone, index, zones) => zones.findIndex((item) => item.slot === zone.slot) === index,
    ),
    [activeZone],
  );

  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Collective Manifestation home">
            Collective Manifestation
          </a>
          <div className="nav-links">
            {navigation.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}>
                {item}
              </a>
            ))}
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">ManifestWave 528</p>
            <h1>A 24-hour global wave of focused intention.</h1>
            <p className="lede">
              Collective Manifestation is a public home for the daily 5:28 Manifest Call — a simple,
              symbolic rhythm where each time zone carries the wave for one local hour.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#manifestwave">
                View today&apos;s wave
              </a>
              <a className="button secondary" href="#music">
                Explore the music
              </a>
            </div>
          </div>

          <aside className="now-card" aria-labelledby="current-wave-title">
            <p className="eyebrow">Current UTC slot</p>
            <h2 id="current-wave-title">{activeZone.label}</h2>
            <p>5:00 PM – 5:59 PM local wave window</p>
            <strong>5:28 PM Manifest Call</strong>
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
          The site will use real HTML data for the country lists and the draft PNG cards as visual aids.
          The first implementation keeps the 24 symbolic hourly zones simple while preserving detail for
          multi-zone countries like the United States.
        </p>
      </section>

      <section className="zone-feature-grid" aria-label="Featured ManifestWave zones">
        {featuredZones.map((zone) => (
          <article className="zone-feature" key={zone.slot}>
            <img src={getSlotCardPath(zone.slot)} alt={`${zone.label} card preview`} />
            <div>
              <h3>{zone.label}</h3>
              <p>{zone.countries.length} representative countries/regions wired into the skeleton.</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section cards-section">
        <div>
          <p className="eyebrow">24 symbolic cards</p>
          <h2>Draft country-name + flag cards are ready for the web build.</h2>
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
          <h2>Music library placeholder</h2>
          <p>
            Next pass will move selected MP3 tracks, lyrics, artwork, and Supabase-backed song metadata
            into this section.
          </p>
        </div>
        <div className="panel">
          <strong>Supabase status</strong>
          <p>{isSupabaseConfigured ? 'Configured via Vite environment variables.' : 'Ready for env vars; not connected yet.'}</p>
        </div>
      </section>

      <section className="section split" id="about">
        <div>
          <p className="eyebrow">About</p>
          <h2>Build a calm, useful home for the movement.</h2>
          <p>
            This skeleton is intentionally static-first: fast, reviewable, and safe to preview before any
            Vercel or DNS changes.
          </p>
        </div>
        <div className="panel" id="contact">
          <strong>Contact / waitlist placeholder</strong>
          <p>Supabase forms will be added after schema approval.</p>
        </div>
      </section>

      <section className="section support" id="support">
        <p className="eyebrow">Support</p>
        <h2>Donation/support links will live here after copy and payment paths are confirmed.</h2>
      </section>
    </main>
  );
}

export default App;
