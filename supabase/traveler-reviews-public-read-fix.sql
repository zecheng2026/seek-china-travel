-- PR #166: public review read permissions (run after traveler-reviews.sql)
-- Approved reviews are publicly readable, but private emails are never exposed.
alter table public.traveler_reviews enable row level security;
drop policy if exists "Public can read approved reviews" on public.traveler_reviews;
create policy "Public can read approved reviews"
on public.traveler_reviews for select to anon, authenticated
using (status = 'approved');

-- Supabase/PostgREST uses table grants AND RLS. Grant only safe public columns.
revoke select on table public.traveler_reviews from anon, authenticated;
grant select (id, context_type, context_slug, name, rating, body, status, admin_reply, created_at)
on public.traveler_reviews to anon, authenticated;

-- Do not grant INSERT/UPDATE/DELETE: the existing validated submission and
-- authenticated moderation RPCs handle those operations.
revoke insert, update, delete on table public.traveler_reviews from anon, authenticated;
