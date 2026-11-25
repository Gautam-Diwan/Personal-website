/**
 * Approximate visitor location from Vercel's built-in IP geolocation headers.
 * First-party only: nothing is sent to a third-party service and nothing is stored.
 * https://vercel.com/docs/headers/request-headers#x-vercel-ip-latitude
 */
export function GET(request: Request) {
  const h = request.headers;
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

  const lat = num("x-vercel-ip-latitude");
  const lon = num("x-vercel-ip-longitude");
  const body =
    lat === null || lon === null
      ? { ok: false }
      : {
          ok: true,
          lat,
          lon,
          city: text("x-vercel-ip-city"),
          region: text("x-vercel-ip-country-region"),
          country: text("x-vercel-ip-country"),
        };

  return Response.json(body, {
    headers: { "cache-control": "private, no-store" },
  });
}
