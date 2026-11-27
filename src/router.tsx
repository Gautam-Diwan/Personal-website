import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { SceneBackground } from "./components/layout/SceneBackground";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { GroupPage } from "./pages/GroupPage";
import { WorkInProgress } from "./pages/WorkInProgress";
import { PageContainer } from "./components/ui";
import { GROUPS } from "./lib/groups";
import { ease } from "./lib/motion";

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <DarkModeProvider>
      <SceneBackground />
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="min-h-screen"
      >
        <Outlet />
      </motion.main>
      <Footer />
      <Toaster theme="system" />
    </DarkModeProvider>
  );
}

function NotFound() {
  return (
    <PageContainer className="flex min-h-[70svh] items-center pb-20 pt-32">
      <div className="max-w-[40rem]">
        <p
          className="text-sm font-extrabold uppercase tracking-[0.14em]"
          style={{ color: "rgb(var(--ai))" }}
        >
          Error 404
        </p>
        <h1 className="mt-3 text-[clamp(2.6rem,7vw,4.8rem)] font-black leading-[1.02] tracking-[-0.03em] text-fg">
          This page{" "}
          <span style={{ color: "rgb(var(--accent))" }}>drifted off</span>.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
          The link might be old (project pages now open as panels on each domain
          page) or mistyped.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-6">
          <Link to="/" className="btn-primary">
            Back home
          </Link>
          <Link to="/systems" className="btn-ghost">
            Browse projects
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});

const groupRoutes = GROUPS.map((g) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: g.path,
    component: () => <GroupPage key={g.id} groupId={g.id} />,
  }),
);

// The blog CMS (components/Blog.tsx) is parked until there are posts to show.
const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: WorkInProgress,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  ...groupRoutes,
  blogRoute,
]);

export const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
