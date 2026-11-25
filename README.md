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
