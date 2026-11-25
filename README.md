# Portfolio for Gautam Diwan

Live at [gautamdiwan.com](https://gautamdiwan.com).

## Stack

Vite · React 19 · TanStack Router · Tailwind CSS · three.js (React Three Fiber) · Framer Motion · Convex

## Routes

| Path | Page |
| --- | --- |
| `/` | Main page: hero, domains, selected work, experience, toolkit |
| `/systems`, `/ml`, `/ai`, `/web` | Domain pages, filtered by each project's `groups` |
| `/projects/:slug` | Project detail |
| `/blog` | Blog with admin-only post management |

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
