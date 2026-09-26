# SEEK CHINA TRAVEL — Phase 1 Prototype

A responsive Next.js prototype based on the supplied SCT visual reference.

## Included
- Home page
- Tours listing
- Tour detail
- Destinations
- Get a Quote form UI
- Admin dashboard concept
- Responsive desktop/mobile styling
- Netlify configuration

## Run locally
```bash
npm install
npm run dev
```

## Deploy
1. Push this folder to GitHub.
2. Import the repository into Netlify.
3. Build command: `npm run build`
4. Netlify should detect Next.js automatically.

## Important production tasks
The current build is a front-end prototype. Before launch, connect:
- Quote form submission (Netlify Forms, serverless function, or CRM)
- Authentication and role-based admin access
- Database (recommended: Supabase/PostgreSQL)
- Real tour/destination CMS data
- Analytics / Meta Pixel / GA4 / UTM attribution
- WhatsApp contact details
- Production photography and final brand assets
- SEO metadata, schema and sitemap per page

## Supabase and the static admin

The `/admin` route is a browser-only administration portal designed to preserve the
Cloudflare Pages static export. It uses Supabase email/password Auth, reads the
existing public-schema tables under the signed-in user's Row Level Security (RLS)
policies, and uploads images to the existing `website-media` Storage bucket.

Configure these **public** variables in both local development and Cloudflare Pages:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
```

Never place a `service_role` key or database password in a `NEXT_PUBLIC_` variable.
Authentication in the browser only controls the admin experience; database and
Storage RLS policies are the security boundary.

The repository does not contain a generated database schema. Consequently, the
admin renders existing table columns dynamically and deliberately does not guess
write payloads. Generate and commit Supabase database types before adding table
CRUD or wiring the public inquiry form, then map forms to verified column names and
constraints. Media uploads do not require a guessed `media` row shape: the public
Storage URL is returned for copying after a successful upload.
