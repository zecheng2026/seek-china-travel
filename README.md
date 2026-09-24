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
