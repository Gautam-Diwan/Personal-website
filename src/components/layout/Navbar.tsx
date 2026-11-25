import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X, Github } from "lucide-react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { GROUPS } from "../../lib/groups";
import { ease } from "../../lib/motion";

const NAV = [
  { to: "/", label: "Home", color: "accent" },
  ...GROUPS.map((g) => ({ to: g.path, label: g.id === "ml" ? "ML" : g.id === "ai" ? "AI" : g.label, color: g.id })),
  { to: "/blog", label: "Blog", color: "accent" },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
}

export function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isActive = useActive();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className={`mx-auto flex max-w-page items-center justify-between rounded-full border px-3 py-2 transition-all duration-300 ${
          scrolled || open
            ? "border-line/10 bg-bg/70 shadow-[0_8px_30px_rgb(0_0_0/0.12)] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link to="/" className="group flex items-center gap-2.5 pl-1" aria-label="Gautam Diwan, home">
          <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-fg font-mono text-[11px] font-medium text-bg">
            GD
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </span>
          <span className="hidden text-sm font-medium tracking-tight sm:block">Gautam Diwan</span>
        </Link>

        <ul className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.to);
            const tinted = item.color !== "accent";
            const c = (a: number) => `rgb(var(--${item.color}) / ${a})`;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`group/nav relative block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    tinted ? "" : active ? "text-fg" : "text-muted hover:text-fg"
                  }`}
                  style={tinted ? { color: c(active ? 1 : 0.78) } : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border"
                      style={
                        tinted
                          ? { background: c(0.12), borderColor: c(0.35) }
                          : { background: "rgb(var(--fg) / 0.06)", borderColor: "rgb(var(--line) / 0.1)" }
                      }
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {!active && tinted && (
                    <span
                      className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100"
                      style={{ background: c(0.08) }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/Gautam-Diwan"
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg sm:grid"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
          <button
            onClick={toggleDarkMode}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25 }}
              >
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <a href="mailto:gdiwan@cs.cmu.edu" className="btn-primary hidden !px-4 !py-2 !text-[13px] sm:inline-flex">
            Get in touch
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-full text-fg hover:bg-fg/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease }}
            className="card mx-auto mt-2 max-w-page !bg-bg/90 p-2 backdrop-blur-xl md:hidden"
          >
            {NAV.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={item.to}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium ${
                    item.color === "accent" ? (isActive(item.to) ? "bg-fg/[0.06] text-fg" : "text-muted") : ""
                  }`}
                  style={
                    item.color === "accent"
                      ? undefined
                      : {
                          color: `rgb(var(--${item.color}))`,
                          background: isActive(item.to) ? `rgb(var(--${item.color}) / 0.12)` : undefined,
                        }
                  }
                >
                  {item.label === "ML" ? "Machine Learning" : item.label === "AI" ? "Artificial Intelligence" : item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
