# PR #166 — Traveler reviews setup and verification

Do not merge until the following setup and end-to-end checks pass.

## Supabase setup
1. Open Supabase Dashboard → SQL Editor for the same project used by the preview.
2. Execute `supabase/traveler-reviews.sql` (this creates the table, policies, submission RPC, and moderation RPCs).
3. In Supabase Authentication → Users, find the UUID of the existing SCT admin login.
4. Run in SQL Editor (replace the placeholder with that exact UUID):
   ```sql
   insert into public.review_admin_users(user_id)
   values ('YOUR-AUTH-USER-UUID')
   on conflict do nothing;
   ```
5. Never use the service-role key in client-side code. Only allowlisted Auth users can access pending reviews and email addresses.

## Verify preview before merge
- A tour and destination with no reviews still show the form and no fictitious reviews.
- Submit one test review for a tour, destination, and /reviews. Each should show the moderation success message.
- Review submissions must remain hidden from anonymous visitors until approved.
- In /admin → 游客评论, confirm all three appear in 待审核.
- Approve one; verify it appears on the correct detail page and /reviews, without exposing email.
- Save a reply, hide, reapprove, and delete a test review; verify each public result.
- Verify legacy homepage and Contact Us review sections are unchanged except links.
- Check mobile layout and floating contact panel → Leave a Review link.
- Confirm SQL errors are gone and CI build passes.
- Add production edge anti-abuse protections (e.g. Cloudflare rate limiting and CAPTCHA) before exposing submission to significant traffic.

This PR intentionally does not deploy database changes automatically or merge itself.
