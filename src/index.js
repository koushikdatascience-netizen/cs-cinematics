export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    const { pathname } = new URL(request.url);

    if (pathname.endsWith(".css") || pathname.endsWith(".js") || pathname.endsWith(".svg")) {
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (pathname.endsWith("/robots.txt") || pathname.endsWith("/sitemap.xml")) {
      headers.set("Cache-Control", "public, max-age=3600");
    } else if (pathname === "/" || pathname.endsWith(".html")) {
      headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers
    });
  }
};
