-- Shared, non-destructive metadata for existing Storage images.
-- Run in Supabase SQL Editor before testing PR #207 preview.
create table if not exists public.media_library_tags (
  bucket text not null default 'website-media' check (bucket = 'website-media'),
  object_path text not null,
  destination text not null default '',
  purpose text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (bucket, object_path),
  constraint media_library_tags_path_nonempty check (length(trim(object_path)) > 0)
);
alter table public.media_library_tags enable row level security;
revoke all on public.media_library_tags from anon;
grant select, insert, update on public.media_library_tags to authenticated;
-- Only signed-in admin-panel users can view and edit tags.
-- This app currently gates its admin panel on Supabase authentication.
drop policy if exists media_library_tags_read on public.media_library_tags;
create policy media_library_tags_read on public.media_library_tags
 for select to authenticated using (true);
drop policy if exists media_library_tags_insert on public.media_library_tags;
create policy media_library_tags_insert on public.media_library_tags
 for insert to authenticated with check (bucket = 'website-media' and updated_by = auth.uid());
drop policy if exists media_library_tags_update on public.media_library_tags;
create policy media_library_tags_update on public.media_library_tags
 for update to authenticated using (bucket = 'website-media')
 with check (bucket = 'website-media' and updated_by = auth.uid());
-- No DELETE policy. Tags never move, modify or delete Storage objects.
