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
  if(!check.ok) return existing;
  const rows: unknown = await check.json();
  valid = Array.isArray(rows) && rows.length > 0;
 } catch { return existing; }
 if(!valid) return existing;
 // Bypass this Function and fetch the prebuilt client-rendered shell asset.
 const shell = new URL("/travel-guide/runtime.html",url.origin);
 const fallback = await context.env.ASSETS.fetch(new Request(shell.toString(),{method:context.request.method}));
 if(!fallback.ok) return existing;
 const headers = new Headers(fallback.headers);
 headers.set("Cache-Control","public, max-age=60, s-maxage=60");
 headers.set("X-SCT-Guide-Fallback","runtime");
 headers.set("X-Robots-Tag","noindex, follow"); // Avoid indexing generic shell before a full static rebuild.
 return new Response(context.request.method==="HEAD"?null:fallback.body,{status:200,headers});
}
