/**
 * Approximate visitor location for the "N miles away" sentence on the home page.
 * First-party only: nothing is sent to a third-party service and nothing is stored.
 *
 * gautamdiwan.com is proxied through Cloudflare, so Vercel's own IP headers
 * (x-vercel-ip-*) describe the Cloudflare edge server, not the visitor. Sources, in order:
 *   1. Cloudflare visitor-location headers (cf-iplatitude / cf-iplongitude / cf-ipcity),
 *      sent when the "Add visitor location headers" Managed Transform is enabled.
 *   2. Vercel IP headers, but only when the request did NOT come through Cloudflare
 *      (direct *.vercel.app traffic), since behind the proxy they point at the edge.
 * Otherwise it reports { ok: false } and the page shows its fallback sentence.
 */

type Geo = { lat: number; lon: number; city: string | null; region: string | null; country: string | null };

function read(h: Headers) {
  const num = (name: string) => {
    const v = parseFloat(h.get(name) ?? "");
    return Number.isFinite(v) ? v : null;
  };
  const text = (name: string) => {
    const v = h.get(name);
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };
  return { num, text };
}

export function locate(h: Headers): (Geo & { source: "cloudflare" | "vercel" }) | null {
  const { num, text } = read(h);

  const cfLat = num("cf-iplatitude");
  const cfLon = num("cf-iplongitude");
  if (cfLat !== null && cfLon !== null) {
    return {
      lat: cfLat,
      lon: cfLon,
      city: text("cf-ipcity"),
      region: text("cf-region-code") ?? text("cf-region"),
      country: text("cf-ipcountry"),
      source: "cloudflare",
    };
  }

  // Behind Cloudflare without its location headers: Vercel would geolocate the edge server.
  const viaCloudflare = h.has("cf-ray") || h.has("cf-connecting-ip");
  if (viaCloudflare) return null;

  const lat = num("x-vercel-ip-latitude");
  const lon = num("x-vercel-ip-longitude");
  if (lat === null || lon === null) return null;
  return {
    lat,
    lon,
    city: text("x-vercel-ip-city"),
    region: text("x-vercel-ip-country-region"),
    country: text("x-vercel-ip-country"),
    source: "vercel",
  };
}

export function GET(request: Request) {
  const geo = locate(request.headers);
  return Response.json(geo ? { ok: true, ...geo } : { ok: false }, {
    headers: { "cache-control": "private, no-store" },
  });
}
