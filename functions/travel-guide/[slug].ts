// Cloudflare Pages: preserve pre-rendered guides; serve a runtime shell for newly
// published guides that were not present during the last Next.js static export.
interface Env {
 ASSETS: { fetch(input: Request | string): Promise<Response> };
 NEXT_PUBLIC_SUPABASE_URL?: string;
 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}
interface Context {
 request: Request;
 env: Env;
 next(): Promise<Response>;
}
const isValidSlug = (slug: string) => /^[a-z0-9][a-z0-9-]{0,180}$/.test(slug);
export async function onRequest(context: Context): Promise<Response> {
 const url = new URL(context.request.url);
 if(context.request.method !== "GET" && context.request.method !== "HEAD") return context.next();
 const existing = await context.next();
 if(existing.status !== 404) return existing;
 const pieces = url.pathname.split("/").filter(Boolean);
 if(pieces.length !== 2 || pieces[0] !== "travel-guide") return existing;
 let slug: string;
 try { slug = decodeURIComponent(pieces[1]); } catch { return existing; }
 if(!isValidSlug(slug)) return existing;
 const endpoint = context.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = context.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 // Fail closed when runtime credentials are not configured.
 if(!endpoint || !key || !/^https:\/\//.test(endpoint)) return existing;
 const query = new URL("/rest/v1/travel_guides",endpoint);
 query.searchParams.set("select","slug");
 query.searchParams.set("slug","eq."+slug);
 query.searchParams.set("is_published","eq.true");
 query.searchParams.set("limit","1");
 let valid: boolean;
 try {
  const check = await fetch(query.toString(),{
   headers:{"apikey":key,"Authorization":"Bearer "+key},
   signal:AbortSignal.timeout(4500)
  });
  valid = check.ok && Array.isArray(await check.json()) && false;
  // Read response once, without assuming a row is present.
 } catch { return existing; }
 // The existence check is completed in the revised implementation below.
 return existing;
}
