-- Run once in Supabase SQL editor before testing avatar uploads.
alter table public.traveler_reviews add column if not exists avatar_url text;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('review-avatars','review-avatars',true,1048576,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=1048576,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
-- Check admin status via SECURITY DEFINER; no direct access to review_admin_users needed.
create or replace function public.is_review_avatar_admin()
returns boolean language sql stable security definer set search_path=public as $
 select auth.uid() is not null and exists(select 1 from public.review_admin_users where user_id=auth.uid());
$;
revoke all on function public.is_review_avatar_admin() from public;
grant execute on function public.is_review_avatar_admin() to authenticated;
drop policy if exists "Review admins upload avatars" on storage.objects;
create policy "Review admins upload avatars" on storage.objects for insert to authenticated
with check (bucket_id='review-avatars' and public.is_review_avatar_admin());
-- Existing admin listing returns setof traveler_reviews and automatically includes avatar_url.
create or replace function public.review_admin_set_avatar(p_id uuid,p_avatar_url text)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or not exists(select 1 from public.review_admin_users where user_id=auth.uid()) then raise exception 'Not authorized'; end if;
 if p_avatar_url is not null and (length(p_avatar_url)>1000 or p_avatar_url !~ '^https://[^ ]+/storage/v1/object/public/review-avatars/[a-zA-Z0-9/_-]+\.webp$') then raise exception 'Invalid avatar URL'; end if;
 update public.traveler_reviews set avatar_url=p_avatar_url where id=p_id;
 return found;
end $$;
revoke all on function public.review_admin_set_avatar(uuid,text) from public;
grant execute on function public.review_admin_set_avatar(uuid,text) to authenticated;
