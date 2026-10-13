-- Review photos: apply in Supabase SQL Editor BEFORE testing PR.
-- Public uploads are limited to newly submitted pending reviews and their one-time upload token.
alter table public.traveler_reviews add column if not exists images text[] not null default '{}';
alter table public.traveler_reviews add column if not exists photo_upload_token uuid;
grant select (images) on public.traveler_reviews to anon, authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('review-photos','review-photos',true,2097152,array['image/webp','image/jpeg'])
on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/webp','image/jpeg'];

-- A token is only returned by the submission RPC to the submitter, never exposed in public SELECT.
create or replace function public.submit_traveler_review_with_photos(
 p_context_type text,p_context_slug text,p_name text,p_email text,p_rating integer,p_body text,p_website text default ''
) returns table(review_id uuid,upload_token uuid)
language plpgsql security definer set search_path=public as $$
declare v_id uuid; v_token uuid;
begin
 v_id:=public.submit_traveler_review(p_context_type,p_context_slug,p_name,p_email,p_rating,p_body,p_website);
 v_token:=gen_random_uuid();
 update public.traveler_reviews set photo_upload_token=v_token where id=v_id;
 return query select v_id,v_token;
end $$;
revoke all on function public.submit_traveler_review_with_photos(text,text,text,text,integer,text,text) from public;
grant execute on function public.submit_traveler_review_with_photos(text,text,text,text,integer,text,text) to anon,authenticated;

-- The guest can upload only to the freshly created review's tokenized path, within 30 minutes.
-- At most three files, each up to 2 MiB, image/webp only.
create or replace function public.can_upload_review_photo(object_name text)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare parts text[]; v_id uuid; v_token uuid;
begin
 parts:=string_to_array(object_name,'/');
 if array_length(parts,1)<>3 or parts[1]!~'^[0-9a-f-]{36}$' or parts[2]!~'^[0-9a-f-]{36}$'
    or parts[3]!~'^[0-9a-f-]{36}\.webp$' then return false; end if;
 v_id:=parts[1]::uuid; v_token:=parts[2]::uuid;
 return exists(select 1 from public.traveler_reviews r
 where r.id=v_id and r.photo_upload_token=v_token and r.status='pending'
 and r.created_at>now()-interval '30 minutes')
 and (select count(*) from storage.objects o where o.bucket_id='review-photos'
 and o.name like parts[1]||'/'||parts[2]||'/%')<3;
exception when others then return false;
end $$;
revoke all on function public.can_upload_review_photo(text) from public;
grant execute on function public.can_upload_review_photo(text) to anon,authenticated;
drop policy if exists "Review guest token photo upload" on storage.objects;
create policy "Review guest token photo upload" on storage.objects for insert to anon,authenticated
with check (bucket_id='review-photos' and public.can_upload_review_photo(name));

-- Attach uploaded URLs after upload. Never allow a guest to attach other review's files.
create or replace function public.attach_review_photos(p_id uuid,p_token uuid,p_paths text[])
returns boolean language plpgsql security definer set search_path=public as $$
declare p text; urls text[]:='{}'; base text;
begin
 if coalesce(array_length(p_paths,1),0)>3 then raise exception 'Maximum three photos'; end if;
 if not exists(select 1 from public.traveler_reviews where id=p_id and photo_upload_token=p_token
 and status='pending' and created_at>now()-interval '30 minutes') then raise exception 'Upload window expired'; end if;
 foreach p in array p_paths loop
  if p not like p_id::text||'/'||p_token::text||'/%'
  or not exists(select 1 from storage.objects where bucket_id='review-photos' and name=p)
  then raise exception 'Invalid photo'; end if;
  urls:=array_append(urls,p);
 end loop;
 update public.traveler_reviews set images=urls,photo_upload_token=null where id=p_id;
 return found;
end $$;
revoke all on function public.attach_review_photos(uuid,uuid,text[]) from public;
grant execute on function public.attach_review_photos(uuid,uuid,text[]) to anon,authenticated;

-- Admin can upload to an existing review's admin/ prefix.
create or replace function public.can_admin_upload_review_photo(object_name text)
returns boolean language sql stable security definer set search_path=public as $$
 select auth.uid() is not null and exists(select 1 from public.review_admin_users where user_id=auth.uid())
 and object_name ~ '^admin/[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$';
$$;
revoke all on function public.can_admin_upload_review_photo(text) from public;
grant execute on function public.can_admin_upload_review_photo(text) to authenticated;
drop policy if exists "Review admin photo upload" on storage.objects;
create policy "Review admin photo upload" on storage.objects for insert to authenticated
with check(bucket_id='review-photos' and public.can_admin_upload_review_photo(name));

create or replace function public.review_admin_set_photos(p_id uuid,p_paths text[])
returns boolean language plpgsql security definer set search_path=public as $$
declare p text;
begin
 if auth.uid() is null or not exists(select 1 from public.review_admin_users where user_id=auth.uid()) then raise exception 'Not authorized'; end if;
 if coalesce(array_length(p_paths,1),0)>6 then raise exception 'Maximum six photos'; end if;
 foreach p in array p_paths loop
  if not exists(select 1 from storage.objects where bucket_id='review-photos' and name=p)
  then raise exception 'Unknown photo'; end if;
 end loop;
 update public.traveler_reviews set images=p_paths where id=p_id;
 return found;
end $$;
revoke all on function public.review_admin_set_photos(uuid,text[]) from public;
grant execute on function public.review_admin_set_photos(uuid,text[]) to authenticated;
