import GuideDetail from "../travel-guide/[slug]/GuideDetailClient";

// Cloudflare Pages rewrites /travel-guide/:slug to /guide?slug=:slug.
// Reuse the same guide detail component as the canonical route so
// related destinations and recommended tours appear on both routes.
export default function RuntimeGuidePage(){
 return <GuideDetail />;
}
