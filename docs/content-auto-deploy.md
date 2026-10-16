# SCT automatic content deployment (separate PR)

The site uses Next.js static export. GitHub pushes trigger builds, but Supabase content changes do not. This solution schedules a Cloudflare Pages deployment after changes to `tours`, `tour_days`, `destinations`, or `travel_guides`.

## Safety and behavior
- No deploy hook URL or shared secret is checked into Git.
- PostgreSQL statement-level triggers increment a revision counter; they do not call Cloudflare directly.
- A Supabase cron job checks once every 5 minutes, collapsing multiple saves into one deploy request.
- The Edge Function verifies a high-entropy shared secret and invokes the Cloudflare deploy hook server-side.
- A failed HTTP request leaves changes pending for the next cron run.
- The Edge Function acknowledges a **queued** build, not a completed/successful deployment. Monitor Cloudflare build failures manually.
- Updates saved during an in-flight request remain pending via the revision counter.
- Only configure the scheduled job once, after successful manual tests.
- A successful rebuild is still required before newly added static detail URLs exist.

## Setup (manual; never paste secrets in chat)
1. Review and apply `supabase/migrations/20261016_content_deploy_queue.sql` in Supabase SQL editor.
2. Deploy `supabase/functions/content-deploy/index.ts` as Edge Function `content-deploy` with **Verify JWT OFF** (shared secret validation is enforced in code). Do not deploy until secrets are configured.
3. In Supabase Edge Function Secrets, set `CLOUDFLARE_DEPLOY_HOOK_URL` to the existing Cloudflare Pages production/main deploy hook. Set `CONTENT_DEPLOY_CRON_SECRET` to a newly generated long random secret. Keep both server-side.
4. Enable `pg_cron` and `pg_net` extensions if necessary. Save the same cron secret to Supabase Vault as `content_deploy_cron_secret`. See commented instructions in SQL migration.
5. Test manually with an authenticated POST from a trusted terminal (never browser/client code) and inspect Cloudflare Deployments. Then enable the cron schedule in the SQL file.
6. Save a draft/unpublished content item, wait up to 5 minutes for a deployment to be queued, and verify Cloudflare logs. Test repeated saves and error handling.
7. Confirm a published record appears in `view-source:` after the new build. Check static detail pages and links.

## Operational caveats
- Each save to monitored tables queues at most one build per cron interval, including drafts. It is a conservative reliability-first approach, not a published-content diff detector.
- Builds might take longer than the 5-minute interval. If many changes are frequent, introduce a build-in-progress gate to avoid overlapping builds.
- Deploy hook HTTP success only means the build request was accepted. The cron job cannot independently confirm build success.
- Requires Supabase plan support for `pg_cron`/`pg_net`, permissions for Vault, and successful Edge Function deployment.
- Keep PR #198 separate; do not merge either PR until tests pass.
