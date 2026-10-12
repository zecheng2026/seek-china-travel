-- Run in Supabase SQL editor before enabling public review submissions.
create table if not exists public.traveler_reviews (
 id uuid primary key default gen_random_uuid(),
 context_type text not null check (context_type in ('tour','destination')),
 context_slug text not null,
 name text not null check (char_length(name) between 1 and 100),
 email text not null check (char_length(email) between 3 and 254),
 rating integer not null check (rating between 1 and 5),
 body text not null check (char_length(body) between 10 and 3000),
 status text not null default 'pending' check (status in ('pending','approved','hidden')),
 admin_reply text,
 created_at timestamptz not null default now()
);
create index if not exists traveler_reviews_lookup_idx on public.traveler_reviews(context_type,context_slug,status,created_at desc);
alter table public.traveler_reviews enable row level security;
drop policy if exists "Public can read approved reviews" on public.traveler_reviews;
create policy "Public can read approved reviews" on public.traveler_reviews for select to anon,authenticated using (status='approved' or (select auth.jwt()->>'role')='service_role');
-- Public cannot directly insert: submissions must go through a rate-limited server endpoint with captcha.
-- Management must use a protected server endpoint and service role, never the public anon key.
