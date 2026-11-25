import { useEffect, useMemo, useState } from "react";
import {
  geoGraticule10,
  geoInterpolate,
  geoNaturalEarth1,
  geoPath,
} from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, MultiPoint } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import { motion, useReducedMotion } from "framer-motion";
import countries110m from "world-atlas/countries-110m.json";
import { HOME, type VisitorGeo } from "../lib/geo";

const topo = countries110m as unknown as Topology<{
  countries: GeometryCollection;
}>;
const COUNTRIES = feature(
  topo,
  topo.objects.countries,
) as unknown as FeatureCollection;

/** Stylized map: Pittsburgh pin (with portrait), visitor pin, and a dashed great-circle route. */
export default function LocationMap({
  visitor,
}: {
  visitor: VisitorGeo | null;
}) {
  const reduced = useReducedMotion();
  // Phones get a taller, narrower frame and ~1.6× larger labels and pins so text stays readable
  const [compact, setCompact] = useState(
    () => window.matchMedia("(max-width: 639px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const W = compact ? 600 : 960;
  const H = compact ? 560 : 460;
  const k = compact ? 1.6 : 1;

  const { countries, graticule, arc, home, you } = useMemo(() => {
    // Frame both points with generous padding; fall back to a North America view
    const pts: [number, number][] = [[HOME.lon, HOME.lat]];
    if (visitor) pts.push([visitor.lon, visitor.lat]);
    const lons = pts.map((p) => p[0]);
    const lats = pts.map((p) => p[1]);
    const span = Math.max(
      Math.max(...lons) - Math.min(...lons),
      (Math.max(...lats) - Math.min(...lats)) * 2,
    );
    const padLon = Math.max(14, span * 0.25);
    const padLat = Math.max(8, span * 0.14);
    const frame: MultiPoint = {
      type: "MultiPoint",
      coordinates: [
        [Math.min(...lons) - padLon, Math.min(...lats) - padLat],
        [Math.max(...lons) + padLon, Math.max(...lats) + padLat],
        ...pts,
      ],
    };
    const projection = geoNaturalEarth1().fitExtent(
      [
        [24, 24],
        [W - 24, H - 24],
      ],
      frame,
    );
    const path = geoPath(projection);
    let arcD: string | null = null;
    if (visitor) {
      const interp = geoInterpolate(
        [HOME.lon, HOME.lat],
        [visitor.lon, visitor.lat],
      );
      arcD = path({
        type: "LineString",
        coordinates: Array.from({ length: 65 }, (_, i) => interp(i / 64)),
      });
    }
    return {
      countries: COUNTRIES.features.map((f) => path(f) ?? ""),
      graticule: path(geoGraticule10()) ?? "",
      arc: arcD,
      home: projection([HOME.lon, HOME.lat])!,
      you: visitor ? projection([visitor.lon, visitor.lat]) : null,
    };
  }, [visitor, W, H]);

  const youLabel = visitor?.city ? `You · ${visitor.city}` : "You (approx.)";
  // Keep the two labels apart when the visitor is close by: label each pin on the side facing away
  const youAbove = you !== null && you[1] < home[1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Map from ${HOME.label} to your approximate location`}
    >
      <defs>
        <clipPath id="home-face">
          <circle cx={home[0]} cy={home[1]} r={24 * k} />
        </clipPath>
        <radialGradient id="map-fade" cx="50%" cy="50%" r="65%">
          <stop offset="70%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id="map-mask">
          <rect width={W} height={H} fill="url(#map-fade)" />
        </mask>
      </defs>

      <g mask="url(#map-mask)">
        <path
          d={graticule}
          fill="none"
          stroke="rgb(var(--line) / 0.08)"
          strokeWidth={1}
        />
        {countries.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="rgb(var(--fg) / 0.07)"
            stroke="rgb(var(--fg) / 0.22)"
            strokeWidth={0.8}
          />
        ))}
      </g>

      {arc && (
        <>
          <motion.path
            d={arc}
            fill="none"
            stroke="rgb(var(--accent))"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="2 9"
            initial={reduced ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
          />
          {!reduced && (
            <motion.circle
              r={6 * k}
              fill="rgb(var(--accent))"
              style={{ offsetPath: `path('${arc}')` } as React.CSSProperties}
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                repeatDelay: 1.2,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          )}
        </>
      )}

      {you && (
        <g>
          {!reduced && (
            <motion.circle
              cx={you[0]}
              cy={you[1]}
              fill="rgb(var(--ai) / 0.35)"
              initial={{ r: 8, opacity: 0.8 }}
              animate={{ r: 26, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
          )}
          <circle
            cx={you[0]}
            cy={you[1]}
            r={9 * k}
            fill="rgb(var(--ai))"
            stroke="rgb(var(--bg))"
            strokeWidth={3}
          />
          <text
            x={you[0]}
            y={youAbove ? you[1] - 20 * k : you[1] + 32 * k}
            textAnchor="middle"
            fontSize={17 * k}
            fontWeight={800}
            fill="rgb(var(--ai))"
            stroke="rgb(var(--bg))"
            strokeWidth={5 * k}
            paintOrder="stroke"
          >
            {youLabel}
          </text>
        </g>
      )}

      <g>
        <circle
          cx={home[0]}
          cy={home[1]}
          r={28 * k}
          fill="rgb(var(--accent))"
        />
        <image
          href="/gautam.jpg"
          x={home[0] - 52 * k}
          y={home[1] - 44 * k}
          width={128 * k}
          height={160 * k}
          clipPath="url(#home-face)"
          preserveAspectRatio="xMidYMid slice"
        />
        <text
          x={home[0]}
          y={youAbove ? home[1] + 50 * k : home[1] - 38 * k}
          textAnchor="middle"
          fontSize={17 * k}
          fontWeight={800}
          fill="rgb(var(--fg))"
          stroke="rgb(var(--bg))"
          strokeWidth={5 * k}
          paintOrder="stroke"
        >
          Me · Pittsburgh
        </text>
      </g>
    </svg>
  );
}
