# Portfolio for Gautam Diwan

Live at [gautamdiwan.com](https://gautamdiwan.com).

## Stack

Vite · React 19 · TanStack Router · Tailwind CSS · three.js (React Three Fiber) · Framer Motion · Convex

## Routes

| Path | Page |
| --- | --- |
| `/` | Main page: hero, domains, selected work, experience, toolkit |
| `/systems`, `/ml`, `/ai`, `/web` | Domain pages, filtered by each project's `groups` |
| `/blog` | Work-in-progress placeholder (the CMS in `src/components/Blog.tsx` is parked) |

Project details open in an overlay on the card, not on their own route. Pin projects to the top of
a domain page with `pinned` in `src/lib/groups.ts` (BusTub is pinned in Systems).

Each domain page can show an interactive showcase (`SHOWCASES` in `src/pages/GroupPage.tsx`):

- **Systems:** optimizer plan selection, then execution through an ARC buffer pool
  (`src/components/viz/QueryPlanViz.tsx`, simulator in `viz/arc.ts`)
- **ML:** Manim-style 3D walkthrough of matrix factorization trained with SGD in the browser
  (`src/components/viz/MatrixFactorizationViz.tsx`, training in `viz/mf.ts`)
- **Web:** request lifecycle through a CQRS/BFF stack with a circuit breaker and latency waterfall
  (`src/components/viz/RequestFlowViz.tsx`)
- **AI:** a chat terminal that renders its answer like a masked text diffusion model
  (`src/components/DiffusionTerminal.tsx`)

A single fixed three.js particle field sits behind every page and morphs to a shape per domain
(`src/components/three/shapes.ts`).

## Portrait

The home hero shows `public/gautam.jpg` (a square crop works best, ~640px). Until that file
exists it falls back to a GD monogram.

## School logos

`public/logos/cmu-wordmark.svg` and `public/logos/thapar.png` come from Wikimedia Commons, where
both are marked public domain; they remain trademarks of their institutions and are used only to
identify where I studied. They sit on a white plate so the brand colors keep contrast in dark mode.

## Visitor distance and map

The home page says how far the visitor is from Pittsburgh. `api/geo.ts` is a Vercel Function that
reads IP-geolocation request headers, so no third-party IP lookup is involved and nothing is stored.

Because gautamdiwan.com is proxied through Cloudflare, Vercel's `x-vercel-ip-*` headers describe the
Cloudflare edge server rather than the visitor. The function therefore prefers Cloudflare's
`cf-iplatitude` / `cf-iplongitude` / `cf-ipcity` headers, which Cloudflare sends once
**Rules → Transform Rules → Managed Transforms → "Add visitor location headers"** is enabled for the
zone. Without them, proxied requests return `{ ok: false }` and the page shows its fallback line
instead of a wrong distance. Direct `*.vercel.app` traffic still uses Vercel's headers. Locally there is no `/api/geo`, so the
sentence falls back to a relocation line; append `?geo=43.65,-79.38` to any URL to simulate a
visitor. The map (`src/components/LocationMap.tsx`) uses d3-geo with Natural Earth 110m countries.

## Sound effects

Navbar clicks, the theme toggle, and a few buttons play short synthesized sounds (Web Audio, no
files, `src/lib/sound.ts`). The speaker icon in the navbar mutes them, and the choice is remembered.

## Editing content

All projects, experiences, and skills live in **`convex/content.ts`**. A project can belong to
any number of groups (`"systems" | "ml" | "ai" | "web"`).

After editing:

1. Bump `CONTENT_VERSION` in **both** `convex/portfolio.ts` and `src/lib/content.ts`.
2. Push functions: `npx convex dev --once` (uses the deployment in `.env.local`).
3. The first page load after that reseeds the portfolio tables automatically.

## Local development

```sh
npm install
npm run dev   # vite + convex dev
```

To work against a throwaway local backend instead of the shared deployment, run from a checkout
without `.env.local`:

```sh
CONVEX_AGENT_MODE=anonymous npx convex dev
npx vite
```
