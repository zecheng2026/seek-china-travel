# PR #170: new Travel Guide / China Travel Updates 404 fallback

## Root cause
Next.js `output: "export"` pre-generates `/travel-guide/[slug]` only for slugs present when Cloudflare builds. The updates index queries Supabase live, so newly published articles can appear in the index while their static HTML does not exist (404).

## Fix
- Keep all existing static guide URLs and their SEO metadata unchanged.
- Generate a reusable `/travel-guide/runtime.html` shell at build time.
- A Cloudflare Pages Function handles `/travel-guide/:slug`. It first tries the existing static asset. **Only if that returns 404**, it validates the slug and checks the Supabase `travel_guides` table for a published record.
- If a published record exists, return the shell with HTTP 200; existing `GuideDetailClient` reads the requested slug from the URL and loads the article from Supabase.
- Unknown, unpublished, invalid, and lookup-error slugs remain 404. No writes to Supabase.

## Deployment requirement
Cloudflare Pages **runtime** environment must expose `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Pages Functions, in addition to the existing build configuration. Do not add a service-role key.

## Preview acceptance checklist
1. Previously published guide URL loads normally (not served by runtime fallback).
2. Newly published news article in listing opens at its canonical `/travel-guide/slug` URL without a rebuild.
3. An unknown slug still gives HTTP 404.
4. Unpublished guide remains inaccessible.
5. Desktop and mobile article layout matches existing GuideDetailClient.
6. Runtime shell response has `X-SCT-Guide-Fallback: runtime` and `X-Robots-Tag: noindex, follow`.

## SEO caveat
The runtime fallback is client-rendered and deliberately **noindex** until a normal Cloudflare rebuild generates a full static SEO page. Continue periodic/release builds for newly published content to become indexable. This avoids presenting an empty generic shell to search engines.

No changes to existing news layout, admin workflows, database schema, or PR #168. No production merge.
