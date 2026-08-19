import { FormEvent, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  AdminBlogPostForm,
  AdminContentClientLike,
  AdminSiteContentForm,
  AdminSiteContentRow,
  AdminSongForm,
  AdminSongRow,
  deleteAdminBlogPost,
  deleteAdminSiteContent,
  deleteAdminSong,
  listAdminBlogPosts,
  listAdminSiteContent,
  listAdminSongs,
  saveAdminBlogPost,
  saveAdminSiteContent,
  saveAdminSong,
} from '../lib/adminContent';
import { BlogPostRow, BlogPostStatus } from '../lib/blog';

type AdminDashboardProps = {
  username: string;
};

type AdminTab = 'blog' | 'songs' | 'text';

type AdminBlogRow = BlogPostRow & { hero_image_path?: string | null };

const initialBlogForm: AdminBlogPostForm = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  status: 'draft',
  publishedAt: '',
  heroImagePath: '',
};

const initialSongForm: AdminSongForm = {
  slug: '',
  title: '',
  trackNumber: 1,
  audioPath: '',
  artworkPath: '',
  lyrics: '',
  description: '',
  isPublished: false,
  isThemeSong: false,
};

const initialTextForm: AdminSiteContentForm = {
  key: '',
  label: '',
  section: 'general',
  value: '',
  isPublished: true,
};

function getAdminClient(): AdminContentClientLike | null {
  return supabase as AdminContentClientLike | null;
}

function formatStatusLabel(status: BlogPostStatus | boolean): string {
  if (typeof status === 'boolean') {
    return status ? 'published' : 'draft';
  }

  return status;
}

function blogRowToForm(row: AdminBlogRow): AdminBlogPostForm {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    status: row.status,
    publishedAt: row.published_at || '',
    heroImagePath: row.hero_image_path || '',
  };
}

function songRowToForm(row: AdminSongRow): AdminSongForm {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    trackNumber: row.track_number || 1,
    audioPath: row.audio_path || '',
    artworkPath: row.artwork_path || '',
    lyrics: row.lyrics || '',
    description: row.description || '',
    isPublished: row.is_published,
    isThemeSong: Boolean(row.is_theme_song),
  };
}

function textRowToForm(row: AdminSiteContentRow): AdminSiteContentForm {
  return {
    key: row.key,
    label: row.label,
    section: row.section,
    value: row.value,
    isPublished: row.is_published,
  };
}

export function AdminDashboard({ username }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('blog');
  const tabs = useMemo(
    () => [
      { id: 'blog' as const, label: 'Blog posts' },
      { id: 'songs' as const, label: 'Songs' },
      { id: 'text' as const, label: 'Site text' },
    ],
    [],
  );

  return (
    <section className="admin-dashboard" aria-label="Admin content tools">
      <div className="admin-dashboard-header">
        <div>
          <span>Admin content tools</span>
          <h4>Website editor for {username}</h4>
          <p>Admin writes are protected by Supabase Auth + RLS. No service-role key is used in the browser.</p>
        </div>
      </div>

      <div className="admin-tabs" aria-label="Admin editor sections">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? 'is-active' : ''}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'blog' ? <AdminBlogPanel /> : null}
      {activeTab === 'songs' ? <AdminSongsPanel /> : null}
      {activeTab === 'text' ? <AdminSiteTextPanel /> : null}
    </section>
  );
}

function AdminBlogPanel() {
  const [rows, setRows] = useState<AdminBlogRow[]>([]);
  const [form, setForm] = useState<AdminBlogPostForm>(initialBlogForm);
  const [status, setStatus] = useState('Loading blog posts…');

  async function loadRows() {
    if (!isSupabaseConfigured) {
      setStatus('Supabase is not configured, so admin blog editing is disabled.');
      return;
    }

    const result = await listAdminBlogPosts(getAdminClient());
    if (result.ok) {
      setRows(result.rows as AdminBlogRow[]);
      setStatus(result.rows.length ? 'Blog posts loaded.' : 'No blog posts yet.');
    } else {
      setStatus(result.error);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  function updateField<Field extends keyof AdminBlogPostForm>(field: Field, value: AdminBlogPostForm[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await saveAdminBlogPost(getAdminClient(), form);
    if (result.ok) {
      setForm(initialBlogForm);
      setStatus('Blog post saved.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  async function handleDelete(row: AdminBlogRow) {
    if (!window.confirm(`Delete blog post "${row.title}"? This removes the database row, not source files.`)) {
      return;
    }

    const result = await deleteAdminBlogPost(getAdminClient(), row.id);
    if (result.ok) {
      setStatus('Blog post deleted.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  return (
    <div className="admin-panel">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h5>{form.id ? 'Edit blog post' : 'Add blog post'}</h5>
        <div className="form-grid">
          <label>
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="my-post-slug" />
          </label>
          <label>
            <span>Status</span>
            <select value={form.status} onChange={(event) => updateField('status', event.target.value as BlogPostStatus)}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
            </select>
          </label>
        </div>
        <label>
          <span>Title</span>
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Post title" />
        </label>
        <label>
          <span>Excerpt</span>
          <textarea value={form.excerpt} onChange={(event) => updateField('excerpt', event.target.value)} rows={3} />
        </label>
        <label>
          <span>Body</span>
          <textarea value={form.body} onChange={(event) => updateField('body', event.target.value)} rows={7} />
        </label>
        <div className="form-grid">
          <label>
            <span>Published at</span>
            <input
              value={form.publishedAt}
              onChange={(event) => updateField('publishedAt', event.target.value)}
              placeholder="2026-08-18T12:00:00.000Z"
            />
          </label>
          <label>
            <span>Hero image path</span>
            <input value={form.heroImagePath} onChange={(event) => updateField('heroImagePath', event.target.value)} />
          </label>
        </div>
        <button className="button primary" type="submit">Save blog post</button>
      </form>

      <AdminRowsList
        emptyLabel="No blog posts loaded."
        rows={rows.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `${row.slug} · ${formatStatusLabel(row.status)}`,
          onEdit: () => setForm(blogRowToForm(row)),
          onDelete: () => void handleDelete(row),
        }))}
      />
      <p className="auth-status">{status}</p>
    </div>
  );
}

function AdminSongsPanel() {
  const [rows, setRows] = useState<AdminSongRow[]>([]);
  const [form, setForm] = useState<AdminSongForm>(initialSongForm);
  const [status, setStatus] = useState('Loading songs…');

  async function loadRows() {
    if (!isSupabaseConfigured) {
      setStatus('Supabase is not configured, so admin song editing is disabled.');
      return;
    }

    const result = await listAdminSongs(getAdminClient());
    if (result.ok) {
      setRows(result.rows);
      setStatus(result.rows.length ? 'Songs loaded.' : 'No Supabase song rows yet. Seed songs before managing live music.');
    } else {
      setStatus(result.error);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  function updateField<Field extends keyof AdminSongForm>(field: Field, value: AdminSongForm[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await saveAdminSong(getAdminClient(), form);
    if (result.ok) {
      setForm(initialSongForm);
      setStatus('Song metadata saved.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  async function handleDelete(row: AdminSongRow) {
    if (!window.confirm(`Delete song metadata for "${row.title}"? This does not delete audio/artwork files.`)) {
      return;
    }

    const result = await deleteAdminSong(getAdminClient(), row.id);
    if (result.ok) {
      setStatus('Song metadata deleted.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  return (
    <div className="admin-panel">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h5>{form.id ? 'Edit song metadata' : 'Add song metadata'}</h5>
        <div className="form-grid">
          <label>
            <span>Slug</span>
            <input value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="song-slug" />
          </label>
          <label>
            <span>Track number</span>
            <input
              type="number"
              min="1"
              value={form.trackNumber}
              onChange={(event) => updateField('trackNumber', Number(event.target.value))}
            />
          </label>
        </div>
        <label>
          <span>Title</span>
          <input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Song title" />
        </label>
        <label>
          <span>Audio path</span>
          <input value={form.audioPath} onChange={(event) => updateField('audioPath', event.target.value)} placeholder="/assets/music/song.mp3" />
        </label>
        <label>
          <span>Artwork path</span>
          <input
            value={form.artworkPath}
            onChange={(event) => updateField('artworkPath', event.target.value)}
            placeholder="/assets/artworkformusiv/song.jpg"
          />
        </label>
        <label>
          <span>Description</span>
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={3} />
        </label>
        <label>
          <span>Lyrics</span>
          <textarea value={form.lyrics} onChange={(event) => updateField('lyrics', event.target.value)} rows={6} />
        </label>
        <label className="admin-checkbox">
          <input
            checked={form.isPublished}
            onChange={(event) => updateField('isPublished', event.target.checked)}
            type="checkbox"
          />
          <span>Published</span>
        </label>
        <label className="admin-checkbox">
          <input
            checked={form.isThemeSong}
            onChange={(event) => updateField('isThemeSong', event.target.checked)}
            type="checkbox"
          />
          <span>Theme Song highlight</span>
        </label>
        <button className="button primary" type="submit">Save song</button>
      </form>

      <AdminRowsList
        emptyLabel="No Supabase song rows loaded."
        rows={rows.map((row) => ({
          id: row.id,
          title: row.title,
          meta: `Track ${row.track_number || '—'} · ${formatStatusLabel(row.is_published)}${row.is_theme_song ? ' · Theme Song' : ''}`,
          onEdit: () => setForm(songRowToForm(row)),
          onDelete: () => void handleDelete(row),
        }))}
      />
      <p className="auth-status">{status}</p>
    </div>
  );
}

function AdminSiteTextPanel() {
  const [rows, setRows] = useState<AdminSiteContentRow[]>([]);
  const [form, setForm] = useState<AdminSiteContentForm>(initialTextForm);
  const [status, setStatus] = useState('Loading site text…');

  async function loadRows() {
    if (!isSupabaseConfigured) {
      setStatus('Supabase is not configured, so admin site text editing is disabled.');
      return;
    }

    const result = await listAdminSiteContent(getAdminClient());
    if (result.ok) {
      setRows(result.rows);
      setStatus(result.rows.length ? 'Site text keys loaded.' : 'No site text keys yet.');
    } else {
      setStatus(result.error);
    }
  }

  useEffect(() => {
    void loadRows();
  }, []);

  function updateField<Field extends keyof AdminSiteContentForm>(field: Field, value: AdminSiteContentForm[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await saveAdminSiteContent(getAdminClient(), form);
    if (result.ok) {
      setForm(initialTextForm);
      setStatus('Site text saved. Public UI wiring is a separate step per approved text keys.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  async function handleDelete(row: AdminSiteContentRow) {
    if (!window.confirm(`Delete site text key "${row.key}"?`)) {
      return;
    }

    const result = await deleteAdminSiteContent(getAdminClient(), row.key);
    if (result.ok) {
      setStatus('Site text deleted.');
      await loadRows();
    } else {
      setStatus(result.error);
    }
  }

  return (
    <div className="admin-panel">
      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <h5>{rows.some((row) => row.key === form.key) ? 'Edit site text' : 'Add site text key'}</h5>
        <div className="form-grid">
          <label>
            <span>Key</span>
            <input value={form.key} onChange={(event) => updateField('key', event.target.value)} placeholder="hero.headline" />
          </label>
          <label>
            <span>Section</span>
            <input value={form.section} onChange={(event) => updateField('section', event.target.value)} placeholder="hero" />
          </label>
        </div>
        <label>
          <span>Label</span>
          <input value={form.label} onChange={(event) => updateField('label', event.target.value)} placeholder="Hero headline" />
        </label>
        <label>
          <span>Value</span>
          <textarea value={form.value} onChange={(event) => updateField('value', event.target.value)} rows={6} />
        </label>
        <label className="admin-checkbox">
          <input
            checked={form.isPublished}
            onChange={(event) => updateField('isPublished', event.target.checked)}
            type="checkbox"
          />
          <span>Published</span>
        </label>
        <button className="button primary" type="submit">Save site text</button>
      </form>

      <AdminRowsList
        emptyLabel="No site text keys loaded."
        rows={rows.map((row) => ({
          id: row.key,
          title: row.label,
          meta: `${row.key} · ${row.section} · ${formatStatusLabel(row.is_published)}`,
          onEdit: () => setForm(textRowToForm(row)),
          onDelete: () => void handleDelete(row),
        }))}
      />
      <p className="auth-status">{status}</p>
    </div>
  );
}

function AdminRowsList({
  emptyLabel,
  rows,
}: {
  emptyLabel: string;
  rows: { id: string; title: string; meta: string; onEdit: () => void; onDelete: () => void }[];
}) {
  if (!rows.length) {
    return <p className="admin-empty">{emptyLabel}</p>;
  }

  return (
    <div className="admin-row-list">
      {rows.map((row) => (
        <article key={row.id}>
          <div>
            <strong>{row.title}</strong>
            <span>{row.meta}</span>
          </div>
          <div className="admin-row-actions">
            <button className="button secondary" type="button" onClick={row.onEdit}>Edit</button>
            <button className="button danger" type="button" onClick={row.onDelete}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
