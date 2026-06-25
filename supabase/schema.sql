-- =============================================
-- SCHEMA: Website Chia Sẻ Thủ Thuật MXH
-- =============================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- =============================================
-- CATEGORIES TABLE
-- =============================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  platform text check (platform in ('facebook', 'tiktok', 'instagram', 'youtube', 'all')),
  icon text,
  description text,
  created_at timestamptz default now()
);

-- =============================================
-- TAGS TABLE
-- =============================================
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- =============================================
-- POSTS TABLE
-- =============================================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text,
  excerpt text,
  platform text check (platform in ('facebook', 'tiktok', 'instagram', 'youtube')),
  category_id uuid references categories(id) on delete set null,
  tags text[] default '{}',
  cover_image text,
  views integer default 0,
  status text default 'draft' check (status in ('draft', 'published')),
  author_id uuid references auth.users(id) on delete set null,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- FULL-TEXT SEARCH INDEX (pg_trgm)
-- =============================================
create index if not exists posts_trgm_title_idx 
  on posts using gin (title gin_trgm_ops);

create index if not exists posts_trgm_content_idx 
  on posts using gin (
    (coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')) gin_trgm_ops
  );

create index if not exists posts_platform_idx on posts (platform);
create index if not exists posts_status_idx on posts (status);
create index if not exists posts_created_at_idx on posts (created_at desc);

-- =============================================
-- AUTO-UPDATE updated_at TRIGGER
-- =============================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger posts_updated_at
  before update on posts
  for each row execute function update_updated_at_column();

-- =============================================
-- SEARCH FUNCTION (pg_trgm similarity)
-- =============================================
create or replace function search_posts(query text, lim integer default 20, off integer default 0)
returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  platform text,
  cover_image text,
  views integer,
  created_at timestamptz,
  similarity_score real
) as $$
begin
  return query
  select
    p.id,
    p.title,
    p.slug,
    p.excerpt,
    p.platform,
    p.cover_image,
    p.views,
    p.created_at,
    similarity(p.title || ' ' || coalesce(p.excerpt, ''), query) as similarity_score
  from posts p
  where 
    p.status = 'published'
    and (
      p.title ilike '%' || query || '%'
      or p.excerpt ilike '%' || query || '%'
      or similarity(p.title || ' ' || coalesce(p.excerpt, ''), query) > 0.1
    )
  order by similarity_score desc, p.created_at desc
  limit lim
  offset off;
end;
$$ language plpgsql security definer;

-- =============================================
-- INCREMENT VIEW COUNTER FUNCTION
-- =============================================
create or replace function increment_post_views(post_slug text)
returns void as $$
begin
  update posts set views = views + 1 where slug = post_slug and status = 'published';
end;
$$ language plpgsql security definer;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Posts RLS
alter table posts enable row level security;

create policy "Anyone can read published posts"
  on posts for select
  using (status = 'published');

create policy "Authenticated users can do everything on posts"
  on posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Categories RLS
alter table categories enable row level security;

create policy "Anyone can read categories"
  on categories for select
  using (true);

create policy "Authenticated users can manage categories"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Tags RLS
alter table tags enable row level security;

create policy "Anyone can read tags"
  on tags for select
  using (true);

create policy "Authenticated users can manage tags"
  on tags for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
