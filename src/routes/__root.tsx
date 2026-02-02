import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sonner";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { DarkModeProvider } from "../contexts/DarkModeContext";

export const Route = createRootRoute({
  component: () => (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
        <Footer />
        <Toaster />
        <TanStackRouterDevtools />
      </div>
    </DarkModeProvider>
  ),
});
