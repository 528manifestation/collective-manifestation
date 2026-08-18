-- Blog posts schema for Collective Manifestation.
-- Local migration only until Rick manually applies it to the fresh Supabase project.

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 140),
  excerpt text not null check (char_length(excerpt) between 10 and 280),
  body text not null,
  hero_image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create index if not exists blog_posts_status_published_at_idx
on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_author_id_idx
on public.blog_posts (author_id);

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are public" on public.blog_posts;
create policy "Published blog posts are public"
on public.blog_posts for select
using (status = 'published' and published_at <= now());

-- No public insert/update/delete policies are included.
-- Drafting/editing should happen through the Supabase dashboard or a future admin-only tool.

notify pgrst, 'reload schema';
