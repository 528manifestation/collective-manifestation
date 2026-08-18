import { blogPosts, getPublishedBlogPosts } from '../lib/blog';

const publishedPosts = getPublishedBlogPosts(blogPosts);

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
  return (
    <section className="section blog-section" id="blog">
      <div className="blog-header">
        <div>
          <p className="eyebrow">Blog</p>
          <h2>Notes from the ManifestWave.</h2>
        </div>
        <p>
          A launch-ready place for short public updates, practice notes, and member-community
          announcements. Today this is local content; Supabase will hold drafts and published posts next.
        </p>
      </div>

      <div className="blog-grid" aria-label="Published blog posts">
        {publishedPosts.map((post) => (
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
