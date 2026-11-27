import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { GROUPS } from "../../lib/groups";
import { ease } from "../../lib/motion";
import {
  onSoundChange,
  playBlip,
  playPop,
  playSwitch,
  setSoundEnabled,
  soundEnabled,
} from "../../lib/sound";
import { TechLogo } from "../TechLogo";

const NAV = [
  { to: "/", label: "Home", color: "fg" },
  { to: "/about", label: "About", color: "fg" },
  ...GROUPS.map((g) => ({
    to: g.path,
    label: g.id === "ml" ? "ML" : g.id === "ai" ? "AI" : g.label,
    color: g.id,
  })),
  { to: "/visualizations", label: "Visuals", color: "accent" },
  { to: "/blog", label: "Blog", color: "fg" },
] as const;

function useActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function useSound() {
  const [on, setOn] = useState(soundEnabled);
  useEffect(() => {
    const off = onSoundChange(setOn);
    return () => {
      off();
    };
  }, []);
  return on;
}

const iconBtn =
  "grid h-10 w-10 place-items-center rounded-lg text-fg transition-colors hover:bg-fg/[0.07] active:scale-95";

export function Navbar() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isActive = useActive();
  const sound = useSound();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const toggleTheme = () => {
    playSwitch(!isDark);
    toggleDarkMode();
  };
  const toggleSound = () => {
    if (sound) {
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      playBlip();
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b hairline bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease }}
        className="mx-auto flex h-[68px] max-w-page items-center justify-between gap-4 px-4 sm:px-6"
        aria-label="Main"
      >
        <Link
          to="/"
          onClick={() => playPop(0.9)}
          className="group flex items-center gap-2.5"
          aria-label="Gautam Diwan, home"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-lg font-mono text-xs font-bold text-bg transition-transform duration-300 group-hover:-rotate-6"
            style={{ background: "rgb(var(--accent))" }}
          >
            GD
          </span>
          <span className="hidden whitespace-nowrap text-lg font-extrabold tracking-tight text-fg sm:block md:hidden lg:block">
            Gautam Diwan
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item, i) => {
            const active = isActive(item.to);
            const color = `rgb(var(--${item.color}))`;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => playPop(0.85 + i * 0.07)}
                  className="relative block px-3 py-2 text-[15px] font-bold transition-transform hover:-translate-y-px"
                  style={{ color }}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full"
                      style={{ background: color }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-0.5">
          <button
            onClick={toggleSound}
            className={iconBtn}
            aria-label={sound ? "Disable sounds" : "Enable sounds"}
            aria-pressed={sound}
          >
            {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>
          <button
            onClick={toggleTheme}
            className={iconBtn}
            aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25 }}
              >
                {isDark ? <Moon size={19} /> : <Sun size={19} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <a
            href="https://github.com/Gautam-Diwan"
            target="_blank"
            rel="noreferrer"
            onClick={() => playPop(1.2)}
            className={`${iconBtn} hidden sm:grid`}
            aria-label="GitHub"
          >
            <TechLogo name="GitHub" size={19} />
          </a>
          <button
            onClick={() => {
              playPop(open ? 0.8 : 1);
              setOpen((o) => !o);
            }}
            className={`${iconBtn} md:hidden`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease }}
            className="overflow-hidden border-t hairline px-4 md:hidden"
          >
            {NAV.map((item, i) => (
              <li key={item.to} className="border-b hairline last:border-b-0">
                <Link
                  to={item.to}
                  onClick={() => playPop(0.85 + i * 0.07)}
                  className="flex items-center justify-between py-3.5 text-lg font-bold"
                  style={{ color: `rgb(var(--${item.color}))` }}
                >
                  {item.label === "ML"
                    ? "Machine Learning"
                    : item.label === "AI"
                      ? "Artificial Intelligence"
                      : item.label}
                  {isActive(item.to) && (
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: `rgb(var(--${item.color}))` }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
