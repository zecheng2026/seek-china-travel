-- Run once in Supabase SQL Editor before enabling the public inquiry form.
-- Existing inquiries rows and columns are preserved.
alter table public.inquiries add column if not exists name text;
alter table public.inquiries add column if not exists email text;
alter table public.inquiries add column if not exists phone text;
alter table public.inquiries add column if not exists travel_dates text;
alter table public.inquiries add column if not exists travelers text;
alter table public.inquiries add column if not exists destinations text;
alter table public.inquiries add column if not exists tour_name text;
alter table public.inquiries add column if not exists message text;
alter table public.inquiries add column if not exists source text;
alter table public.inquiries add column if not exists status text;
alter table public.inquiries enable row level security;
grant insert on public.inquiries to anon, authenticated;
-- Allow public submission but do not grant anonymous SELECT, UPDATE or DELETE.
drop policy if exists "Public can submit travel inquiries" on public.inquiries;
create policy "Public can submit travel inquiries" on public.inquiries
 for insert to anon, authenticated
 with check (
   source = 'website' and status = 'new'
   and length(trim(coalesce(name,''))) between 1 and 120
   and length(trim(coalesce(email,''))) between 3 and 254
   and length(trim(coalesce(message,''))) between 1 and 5000
 );
-- Review existing table NOT NULL constraints before launch: pre-existing required
-- columns not populated by this form may require defaults or a tailored insert.
-- Consider server-side anti-spam/rate limiting before paid advertising.
