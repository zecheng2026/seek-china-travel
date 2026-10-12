-- Run in Supabase SQL editor before enabling public review submissions.
create table if not exists public.traveler_reviews (
 id uuid primary key default gen_random_uuid(),
 context_type text not null check (context_type in ('tour','destination','general')),
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

-- Controlled public submission; pending reviews are never publicly readable.
create or replace function public.submit_traveler_review(
 p_context_type text,p_context_slug text,p_name text,p_email text,p_rating integer,p_body text,p_website text default ''
) returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if length(coalesce(p_website,''))>0 then raise exception 'Submission rejected'; end if;
 if p_context_type not in ('tour','destination','general') or length(trim(coalesce(p_context_slug,''))) not between 1 and 180
 or length(trim(coalesce(p_name,''))) not between 1 and 100
 or length(trim(coalesce(p_email,''))) not between 3 and 254
 or trim(p_email) not like '%_@_%._%'
 or p_rating not between 1 and 5
 or length(trim(coalesce(p_body,''))) not between 10 and 3000 then raise exception 'Invalid review details'; end if;
 if (select count(*) from public.traveler_reviews where lower(email)=lower(trim(p_email)) and created_at>now()-interval '1 hour')>=2
 then raise exception 'Too many submissions. Please try again later.'; end if;
 insert into public.traveler_reviews(context_type,context_slug,name,email,rating,body,status)
 values(p_context_type,trim(p_context_slug),trim(p_name),trim(p_email),p_rating,trim(p_body),'pending') returning id into new_id;
 return new_id;
end $$;
revoke all on function public.submit_traveler_review(text,text,text,text,integer,text,text) from public;
grant execute on function public.submit_traveler_review(text,text,text,text,integer,text,text) to anon,authenticated;
