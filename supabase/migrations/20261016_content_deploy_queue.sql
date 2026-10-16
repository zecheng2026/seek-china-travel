-- Apply manually after reviewing. Does not alter public read policies.
create schema if not exists private;
create table if not exists private.content_deploy_state (
  id integer primary key default 1 check (id=1),
  revision bigint not null default 0,
  deployed_revision bigint not null default 0,
  updated_at timestamptz not null default now(),
  last_success_at timestamptz
);
insert into private.content_deploy_state(id) values(1) on conflict do nothing;
revoke all on private.content_deploy_state from anon, authenticated, public;

create or replace function private.mark_content_deploy_dirty()
returns trigger language plpgsql security definer set search_path=private,public
as $$
begin
  update private.content_deploy_state set revision=revision+1,updated_at=now() where id=1;
  return null;
end; $$;
revoke all on function private.mark_content_deploy_dirty() from public,anon,authenticated;

drop trigger if exists content_deploy_dirty on public.tours;
create trigger content_deploy_dirty after insert or update or delete on public.tours
for each statement execute function private.mark_content_deploy_dirty();
drop trigger if exists content_deploy_dirty on public.tour_days;
create trigger content_deploy_dirty after insert or update or delete on public.tour_days
for each statement execute function private.mark_content_deploy_dirty();
drop trigger if exists content_deploy_dirty on public.destinations;
create trigger content_deploy_dirty after insert or update or delete on public.destinations
for each statement execute function private.mark_content_deploy_dirty();
drop trigger if exists content_deploy_dirty on public.travel_guides;
create trigger content_deploy_dirty after insert or update or delete on public.travel_guides
for each statement execute function private.mark_content_deploy_dirty();

-- Called only with service-role privileges by the Edge Function.
create or replace function public.content_deploy_snapshot()
returns table(revision bigint, deployed_revision bigint)
language sql security definer set search_path=private,public as $$
  select s.revision,s.deployed_revision from private.content_deploy_state s where id=1
$$;
revoke all on function public.content_deploy_snapshot() from public,anon,authenticated;
grant execute on function public.content_deploy_snapshot() to service_role;

create or replace function public.content_deploy_ack(target_revision bigint)
returns void language sql security definer set search_path=private,public as $$
 update private.content_deploy_state
 set deployed_revision=greatest(deployed_revision,least(target_revision,revision)),
     last_success_at=now()
 where id=1
$$;
revoke all on function public.content_deploy_ack(bigint) from public,anon,authenticated;
grant execute on function public.content_deploy_ack(bigint) to service_role;

-- Configure the following ONLY after Edge Function secrets have been set.
-- Enable pg_cron and pg_net in Supabase Dashboard -> Database -> Extensions.
-- Create a random shared secret in Supabase Vault, and set the SAME value
-- as CONTENT_DEPLOY_CRON_SECRET in Edge Function secrets.
-- Vault secret name: content_deploy_cron_secret
--
-- select vault.create_secret('<random-secret>', 'content_deploy_cron_secret');
--
-- Schedule at most one check every five minutes; multiple content saves
-- are collapsed into a single deployment. Avoid exposing secrets in Git.
--
-- select cron.schedule('sct-content-deploy-check', '*/5 * * * *', $job$
--   select net.http_post(
--     url := 'https://brvueqebiasyntlscztj.supabase.co/functions/v1/content-deploy',
--     headers := jsonb_build_object(
--       'Content-Type','application/json',
--       'x-content-deploy-secret',(
--         select decrypted_secret from vault.decrypted_secrets
--         where name='content_deploy_cron_secret' limit 1
--       )
--     ),
--     body := '{}'::jsonb
--   );
-- $job$);
