// Cloudflare Pages Function: query-aware redirects for verified HuanYou IDs.
// Do not redirect unknown IDs to unrelated SCT pages.
interface Env {}
interface Context { request: Request; next: () => Promise<Response> }
export async function onRequest(context: Context): Promise<Response> {
  const url = new URL(context.request.url);
  const legacyId = url.searchParams.get("id")?.trim().toUpperCase();
  const destinations: Record<string, string> = {
    D003: "/destinations/chengdu-travel-guide",
  };
  const target = legacyId ? destinations[legacyId] : undefined;
  if (!target) return context.next();
  return Response.redirect(new URL(target, url.origin).toString(), 301);
}
