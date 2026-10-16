// Serve the exact Baidu ownership verification URL without Cloudflare Pages'
// automatic .html -> extensionless clean-URL redirect.
// Keep this value in sync with public/baidu_verify_codeva-TVthZxs1fP.html.
export function onRequest() {
  return new Response("ec4ae97eeacbb3425ed95e87c687b70f", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
