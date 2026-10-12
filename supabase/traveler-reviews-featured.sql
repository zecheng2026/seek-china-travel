-- Run once in Supabase SQL Editor AFTER the existing review migration.
alter table public.traveler_reviews add column if not exists featured_home boolean not null default false;
alter table public.traveler_reviews add column if not exists featured_reviews boolean not null default false;
create index if not exists traveler_reviews_featured_idx on public.traveler_reviews(featured_reviews,created_at desc) where status='approved';
-- Public reads need column grants as well as RLS. Never expose email.
grant select (featured_home,featured_reviews) on public.traveler_reviews to anon,authenticated;

create or replace function public.review_admin_feature(p_id uuid,p_location text,p_enabled boolean)
returns boolean language plpgsql security definer set search_path=public as $$
declare current_count integer;
begin
 if auth.uid() is null or not exists(select 1 from public.review_admin_users where user_id=auth.uid()) then raise exception 'Not authorized'; end if;
 if p_location not in ('home','reviews') then raise exception 'Invalid location'; end if;
 if p_enabled then
   if not exists(select 1 from public.traveler_reviews where id=p_id and status='approved') then raise exception 'Approve review first'; end if;
   if p_location='home' then
     select count(*) into current_count from public.traveler_reviews where featured_home and status='approved' and id<>p_id;
   else
     select count(*) into current_count from public.traveler_reviews where featured_reviews and status='approved' and id<>p_id;
   end if;
   if current_count>=3 then raise exception 'Maximum 3 featured reviews for this location'; end if;
 end if;
 if p_location='home' then update public.traveler_reviews set featured_home=p_enabled where id=p_id;
 else update public.traveler_reviews set featured_reviews=p_enabled where id=p_id; end if;
 return found;
end $$;
revoke all on function public.review_admin_feature(uuid,text,boolean) from public;
grant execute on function public.review_admin_feature(uuid,text,boolean) to authenticated;
