import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { SceneProvider } from "./contexts/SceneContext";
import { SceneBackground } from "./components/layout/SceneBackground";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { HomePage } from "./pages/HomePage";
import { GroupPage } from "./pages/GroupPage";
import { ProjectPage } from "./pages/ProjectPage";
import { PageContainer } from "./components/ui";
import { GROUPS } from "./lib/groups";
import { ease } from "./lib/motion";

const Blog = lazy(() => import("./components/Blog").then((m) => ({ default: m.Blog })));

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <DarkModeProvider>
      <SceneProvider>
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
      </SceneProvider>
    </DarkModeProvider>
  );
}

function NotFound() {
  return (
    <PageContainer className="pb-20 pt-44 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight">This page drifted off.</h1>
      <Link to="/" className="btn-ghost mt-8">
        Back home
      </Link>
    </PageContainer>
  );
}

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFound });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: HomePage });

const groupRoutes = GROUPS.map((g) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: g.path,
    component: () => <GroupPage key={g.id} groupId={g.id} />,
  }),
);

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$slug",
  component: ProjectPage,
});

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: () => (
    <PageContainer className="pt-28">
      <Suspense fallback={null}>
        <Blog />
      </Suspense>
    </PageContainer>
  ),
});

const routeTree = rootRoute.addChildren([indexRoute, ...groupRoutes, projectRoute, blogRoute]);

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
