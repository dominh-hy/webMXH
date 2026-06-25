-- Compatibility fix for the Claude-generated schema used by this app.
-- Run this AFTER the Claude schema.
--
-- Why this exists:
-- - The Claude schema's admin RLS policies query auth.users directly.
--   On public reads, PostgREST can evaluate those policies and anon does not
--   have permission to read auth.users, causing:
--   "permission denied for table users".
-- - The app can work with the Claude schema, but a few compatibility columns
--   make admin/editor flows safer.

-- 1) Remove policies that reference auth.users.
drop policy if exists "posts_admin_all" on public.posts;
drop policy if exists "comments_admin_all" on public.comments;

-- 2) Recreate admin policies using JWT claims instead of auth.users.
-- Set a user's app_metadata.role or user_metadata.role to "admin".
create policy "posts_admin_all" on public.posts
  for all
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

create policy "comments_admin_all" on public.comments
  for all
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  with check (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- The current admin UI treats every authenticated Supabase user as an admin.
-- Keep this policy until role management is implemented in the UI.
drop policy if exists "posts_authenticated_manage" on public.posts;
create policy "posts_authenticated_manage" on public.posts
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "categories_authenticated_manage" on public.categories;
create policy "categories_authenticated_manage" on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "tags_authenticated_manage" on public.tags;
create policy "tags_authenticated_manage" on public.tags
  for all
  to authenticated
  using (true)
  with check (true);

-- 3) Ensure public read policies exist.
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select
  using (status = 'published');

-- Claude schema did not enable RLS for categories/tags. These grants keep
-- public category/tag reads explicit.
grant usage on schema public to anon, authenticated;
grant select on public.categories to anon, authenticated;
grant select on public.tags to anon, authenticated;
grant select on public.posts to anon, authenticated;
grant select on public.v_posts_published to anon, authenticated;
grant select on public.v_related_posts to anon, authenticated;

grant execute on function public.increment_post_views(text) to anon, authenticated;
grant execute on function public.get_dashboard_stats() to authenticated;

-- 4) App compatibility columns.
-- The app's original schema had posts.meta_description and posts.tags text[].
-- Claude schema uses meta_desc and post_tags. Add harmless compatibility
-- columns so current admin forms/API payloads do not fail.
alter table public.posts
  add column if not exists meta_description text;

alter table public.posts
  add column if not exists tags text[] default '{}';

update public.posts
set meta_description = coalesce(meta_description, meta_desc)
where meta_description is null and meta_desc is not null;

-- 5) Make category reads predictable if you later enable RLS on categories/tags.
alter table public.categories enable row level security;
alter table public.tags enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select
  using (true);

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read" on public.tags
  for select
  using (true);

notify pgrst, 'reload schema';
