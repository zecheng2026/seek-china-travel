-- Apply after traveler-reviews-featured.sql. Enforces shared Reviews pin limit on submitted-review operations.
create or replace function public.review_admin_feature(p_id uuid,p_location text,p_enabled boolean)
returns boolean language plpgsql security definer set search_path=public as $$
declare current_count integer; manual_count integer; legacy_content jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.review_admin_users where user_id=auth.uid()) then raise exception 'Not authorized'; end if;
 if p_location not in ('home','reviews') then raise exception 'Invalid location'; end if;
 perform pg_advisory_xact_lock(hashtext('sct_review_feature_limit'));
 if p_enabled then
   if not exists(select 1 from public.traveler_reviews where id=p_id and status='approved') then raise exception 'Approve review first'; end if;
   if p_location='home' then
     select count(*) into current_count from public.traveler_reviews where featured_home and status='approved' and id<>p_id;
   else
     select count(*) into current_count from public.traveler_reviews where featured_reviews and status='approved' and id<>p_id;
     select content::jsonb into legacy_content from public.homepage_sections where section_key='home:reviews' limit 1;
     select count(*) into manual_count from jsonb_array_elements(case when jsonb_typeof(legacy_content->'reviews')='array' then legacy_content->'reviews' else '[]'::jsonb end) as r
       where r->>'featured_reviews'='true' and coalesce(r->>'published','true')<>'false' and length(trim(coalesce(r->>'text','')))>0;
     current_count:=current_count+coalesce(manual_count,0);
   end if;
   if current_count>=3 then raise exception 'Reviews/homepage maximum of 3 featured reviews reached'; end if;
 end if;
 if p_location='home' then update public.traveler_reviews set featured_home=p_enabled where id=p_id;
 else update public.traveler_reviews set featured_reviews=p_enabled where id=p_id; end if;
 return found;
end $$;
revoke all on function public.review_admin_feature(uuid,text,boolean) from public;
grant execute on function public.review_admin_feature(uuid,text,boolean) to authenticated;
