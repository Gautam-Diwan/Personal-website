import { useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  useReducedMotion,
  type AnimationPlaybackControls,
} from "framer-motion";
import { ChevronUp, type LucideIcon } from "lucide-react";
import { ease } from "../lib/motion";
import { playPop } from "../lib/sound";

export type IndexSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** CSS variable holding the section's accent RGB channels, e.g. "--ai" */
  color?: string;
};

/** Height of the sticky navbar plus breathing room, so headings don't hide under it. */
const SCROLL_OFFSET = 88;
/** Collapsed-rail geometry, used to place the active-section tag beside it. */
const ROW = 36; // h-9 rows
const RAIL_TOP = 8 + 28 + 8; // py-2 + header h-7 + progress bar (2px + mb-1.5)
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const tint = (s: IndexSection, a = 1) =>
  `rgb(var(${s.color ?? "--accent"}) / ${a})`;

/* ---------- scrolling ---------- */

let running: AnimationPlaybackControls | null = null;

/** Smoothly scroll to a section; the user's own wheel/touch input cancels it. */
function scrollToSection(id: string, reduced: boolean | null) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = Math.max(
    0,
    el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
  );
  running?.stop();
  if (reduced) {
    window.scrollTo(0, target);
    return;
  }
  const cancel = () => running?.stop();
  const opts = { once: true, passive: true } as const;
  window.addEventListener("wheel", cancel, opts);
  window.addEventListener("touchstart", cancel, opts);
  running = animate(window.scrollY, target, {
    duration: Math.min(1.1, 0.45 + Math.abs(target - window.scrollY) / 4000),
    ease,
    onUpdate: (v) => window.scrollTo(0, v),
    onComplete: () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
    },
  });
}

/* ---------- scroll tracking ---------- */

/** Id of the present section that sits under the reading line. */
function useActiveSection(sections: IndexSection[]) {
  const key = sections.map((s) => s.id).join("|");
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const ids = key.split("|");
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      const present = ids.filter((id) => document.getElementById(id));
      let active = present[0];
      for (const id of present) {
        if (document.getElementById(id)!.getBoundingClientRect().top <= line)
          active = id;
      }
      if (atBottom && present.length) active = present[present.length - 1];
      setActive(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}

/* ---------- desktop: icon rail that expands into a labelled panel ---------- */

function DesktopIndex({
  sections,
  activeIndex,
  go,
}: {
  sections: IndexSection[];
  activeIndex: number;
  go: (s: IndexSection, i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = sections[activeIndex];

  return (
    <div className="pointer-events-none fixed inset-y-0 left-3 z-40 hidden items-center xl:flex min-[1440px]:left-5">
      <nav
        aria-label="On this page"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null))
            setOpen(false);
        }}
        className="pointer-events-auto relative"
      >
        {/* wide screens: the current section's name rides beside the collapsed rail */}
        <AnimatePresence>
          {!open && (
            <motion.span
              key="tag"
              initial={{ opacity: 0, x: -4 }}
              animate={{
                opacity: 1,
                x: 0,
                top: RAIL_TOP + activeIndex * ROW + ROW / 2,
              }}
              exit={{ opacity: 0, x: -4, transition: { duration: 0.08 } }}
              transition={spring}
              className="pointer-events-none absolute left-[58px] hidden -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-extrabold min-[1440px]:block"
              style={{ color: tint(active), background: tint(active, 0.12) }}
              aria-hidden="true"
            >
              {active.label}
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div
          initial={false}
          animate={{ width: open ? 228 : 48 }}
          transition={spring}
          className="overflow-hidden rounded-2xl bg-bg/85 py-2 shadow-lg ring-1 ring-fg/10 backdrop-blur-xl"
        >
          {/* header: progress counter, grows a title when open */}
          <div className="flex h-7 items-center gap-2 px-[13px]">
            <span className="font-mono text-[11px] font-bold tabular-nums text-muted">
              <span style={{ color: tint(active) }}>{activeIndex + 1}</span>/
              {sections.length}
            </span>
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.06 } }}
                  exit={{ opacity: 0, x: -6, transition: { duration: 0.1 } }}
                  className="whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted"
                >
                  On this page
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* progress bar under the header */}
          <div className="mx-3 mb-1.5 h-[2px] overflow-hidden rounded-full bg-fg/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: tint(active) }}
              initial={false}
              animate={{
                width: `${((activeIndex + 1) / sections.length) * 100}%`,
              }}
              transition={spring}
            />
          </div>

          <ul>
            {sections.map((s, i) => {
              const isActive = i === activeIndex;
              const Icon = s.icon;
              return (
                <li key={s.id} className="relative px-1.5">
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "location" : undefined}
                    aria-label={s.label}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s, i);
                    }}
                    className="group relative flex h-9 items-center gap-3 rounded-xl px-[7px] outline-none transition-colors hover:bg-fg/[0.06] focus-visible:ring-2 focus-visible:ring-fg/40"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="section-index-active"
                        className="absolute inset-y-0 left-0 rounded-xl"
                        style={{
                          background: tint(s, 0.16),
                          right: open ? 0 : undefined,
                          width: open ? undefined : 36,
                        }}
                        transition={spring}
                        aria-hidden="true"
                      />
                    )}
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.6 : 2}
                      className="relative shrink-0 transition-colors"
                      style={{
                        color: isActive ? tint(s) : "rgb(var(--muted))",
                      }}
                      aria-hidden="true"
                    />
                    <AnimatePresence>
                      {open && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: 0.04 + i * 0.018 },
                          }}
                          exit={{
                            opacity: 0,
                            x: -8,
                            transition: { duration: 0.08 },
                          }}
                          className={`relative whitespace-nowrap text-sm ${isActive ? "font-extrabold" : "font-semibold text-fg/80 group-hover:text-fg"}`}
                          style={isActive ? { color: tint(s) } : undefined}
                        >
                          {s.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </a>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </nav>
    </div>
  );
}

/* ---------- mobile / narrow: floating pill that expands into a sheet ---------- */

function MobileIndex({
  sections,
  activeIndex,
  go,
}: {
  sections: IndexSection[];
  activeIndex: number;
  go: (s: IndexSection, i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = sections[activeIndex];
  const ActiveIcon = active.icon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 xl:hidden"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        style={{ borderRadius: 20 }}
        className="pointer-events-auto w-full max-w-[22rem] overflow-hidden bg-bg/90 shadow-xl ring-1 ring-fg/10 backdrop-blur-xl"
      >
        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              id="section-index-sheet"
              aria-label="On this page"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease }}
            >
              <p className="px-4 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-muted">
                On this page
              </p>
              <ul className="max-h-[50svh] overflow-y-auto px-2 pb-1">
                {sections.map((s, i) => {
                  const isActive = i === activeIndex;
                  const Icon = s.icon;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          go(s, i);
                        }}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] active:bg-fg/[0.08]"
                        style={
                          isActive ? { background: tint(s, 0.14) } : undefined
                        }
                      >
                        <Icon
                          size={18}
                          strokeWidth={isActive ? 2.6 : 2}
                          style={{
                            color: isActive ? tint(s) : "rgb(var(--muted))",
                          }}
                          aria-hidden="true"
                        />
                        <span
                          className={
                            isActive
                              ? "font-extrabold"
                              : "font-semibold text-fg/85"
                          }
                          style={isActive ? { color: tint(s) } : undefined}
                        >
                          {s.label}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="mx-4 h-px bg-fg/10" />
            </motion.nav>
          )}
        </AnimatePresence>

        <motion.button
          layout="position"
          type="button"
          onClick={() => {
            playPop(open ? 0.9 : 1.05);
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          aria-controls="section-index-sheet"
          aria-label={`Current section: ${active.label}. ${open ? "Hide" : "Show"} all sections`}
          className="relative flex w-full items-center gap-3 px-3 py-2.5 text-left"
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ background: tint(active, 0.16) }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={active.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                <ActiveIcon
                  size={17}
                  strokeWidth={2.5}
                  style={{ color: tint(active) }}
                />
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="relative h-5 flex-1 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={active.id}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={{ duration: 0.22, ease }}
                className="absolute inset-0 truncate text-[15px] font-extrabold leading-5 text-fg"
              >
                {active.label}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="font-mono text-xs font-bold tabular-nums text-muted">
            {activeIndex + 1}/{sections.length}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={spring}>
            <ChevronUp size={18} className="text-muted" aria-hidden="true" />
          </motion.span>
          {/* progress along the bottom edge */}
          <span
            className="absolute inset-x-0 bottom-0 h-[2px] bg-fg/5"
            aria-hidden="true"
          >
            <motion.span
              className="block h-full"
              style={{ background: tint(active) }}
              initial={false}
              animate={{
                width: `${((activeIndex + 1) / sections.length) * 100}%`,
              }}
              transition={spring}
            />
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ---------- public component ---------- */

/**
 * "On this page" navigation. Desktop (xl+): an icon rail in the left gutter that
 * expands into a labelled panel on hover/focus. Narrower screens: a floating pill
 * at the bottom (always shown) with the current section, expanding into the full list on tap.
 */
export function SectionIndex({ sections }: { sections: IndexSection[] }) {
  const reduced = useReducedMotion();
  const active = useActiveSection(sections);
  const activeIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === active),
  );
  const go = (s: IndexSection, i: number) => {
    playPop(0.9 + i * 0.05);
    scrollToSection(s.id, reduced);
  };

  if (sections.length < 2) return null;
  return (
    <>
      <DesktopIndex sections={sections} activeIndex={activeIndex} go={go} />
      <MobileIndex sections={sections} activeIndex={activeIndex} go={go} />
    </>
  );
}
