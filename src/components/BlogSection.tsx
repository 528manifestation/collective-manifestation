import { useEffect, useState } from 'react';

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  BlogClientLike,
  BlogPost,
  blogPosts,
  fetchPublishedBlogPosts,
  getPublishedBlogPosts,
} from '../lib/blog';

const fallbackPosts = getPublishedBlogPosts(blogPosts);

function formatPostDate(date: string | null): string {
  if (!date) {
    return 'Draft';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(fallbackPosts);
  const [source, setSource] = useState<'supabase' | 'local'>('local');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || !supabase) {
      return () => {
        isMounted = false;
      };
    }

    fetchPublishedBlogPosts(supabase as unknown as BlogClientLike)
      .then((result) => {
        if (!isMounted) {
          return;
        }

        setPosts(result.posts);
        setSource(result.source);
        setLoadError(result.ok ? null : result.error || 'Could not load Supabase blog posts.');
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setPosts(fallbackPosts);
        setSource('local');
        setLoadError(error instanceof Error ? error.message : 'Could not load Supabase blog posts.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section blog-section" id="blog">
      <div className="blog-header">
        <div>
          <p className="eyebrow">Blog</p>
          <h2>Notes from the ManifestWave.</h2>
        </div>
        <p>
          Published notes load from Supabase when available, with local launch posts kept as a
          safe fallback for the review site.
        </p>
      </div>

      <p className="blog-source-note">
        {source === 'supabase' ? 'Loaded from Supabase.' : 'Showing local launch posts.'}
        {loadError ? ` ${loadError}` : ''}
      </p>

      <div className="blog-grid" aria-label="Published blog posts">
        {posts.map((post) => (
          <article className="blog-card" key={post.id}>
            <div>
              <span>{formatPostDate(post.publishedAt)}</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <a href={`#blog-${post.slug}`} aria-label={`Read ${post.title}`}>
              Read preview
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
