import { useEffect, useState } from "react";

export const HOME = { lat: 40.4406, lon: -79.9959, label: "Pittsburgh, PA" };

export type VisitorGeo = {
  lat: number;
  lon: number;
  city: string | null;
  region: string | null;
  country: string | null;
};

/** Great-circle distance in miles (haversine). */
export function milesBetween(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
) {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Visitor's approximate location from the first-party /api/geo endpoint (Vercel IP headers).
 * `?geo=lat,lon` overrides it, which is handy for local development and testing.
 * Returns undefined while loading and null when unavailable.
 */
export function useVisitorGeo(): VisitorGeo | null | undefined {
  const [geo, setGeo] = useState<VisitorGeo | null | undefined>(undefined);
  useEffect(() => {
    const override = new URLSearchParams(window.location.search).get("geo");
    if (override) {
      const [lat, lon] = override.split(",").map(Number);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        setGeo({ lat, lon, city: null, region: null, country: null });
        return;
      }
    }
    let cancelled = false;
    fetch("/api/geo", { headers: { accept: "application/json" } })
      .then((r) =>
        r.ok && r.headers.get("content-type")?.includes("json")
          ? r.json()
          : null,
      )
      .then((d) => {
        if (cancelled) return;
        setGeo(
          d?.ok
            ? {
                lat: d.lat,
                lon: d.lon,
                city: d.city,
                region: d.region,
                country: d.country,
              }
            : null,
        );
      })
      .catch(() => !cancelled && setGeo(null));
    return () => {
      cancelled = true;
    };
  }, []);
  return geo;
}
