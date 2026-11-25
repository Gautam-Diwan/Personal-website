import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Calendar, Github, Globe, Plus, X } from "lucide-react";
import { GroupBadge } from "./ui";
import { TechPill } from "./TechLogo";
import { projectGroups, type Project } from "../lib/content";
import { GROUP_BY_ID } from "../lib/groups";
import { ease, fadeUp } from "../lib/motion";

export function ProjectDetails({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const groups = projectGroups(project);
  const primary = groups[0];
  const color = primary
    ? `rgb(var(${GROUP_BY_ID[primary].cssVar}))`
    : "rgb(var(--accent))";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`project-${project._id}`}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } }}
        transition={{ duration: 0.4, ease }}
        className="card relative max-h-[92svh] w-full max-w-3xl overflow-y-auto !bg-surface/95 p-6 shadow-2xl sm:p-9"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border hairline text-muted transition-colors hover:text-fg"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex flex-wrap gap-1.5 pr-12">
          {groups.map((g) => (
            <GroupBadge key={g} id={g} />
          ))}
        </div>
        <p className="mt-6 font-mono text-xs" style={{ color }}>
          {project.context}
        </p>
        <h2
          id={`project-${project._id}`}
          className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl"
        >
          {project.title}
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          {project.longDescription}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="chip gap-1.5">
            <Calendar size={12} />
            {project.startDate}
            {project.endDate && project.endDate !== project.startDate
              ? ` → ${project.endDate}`
              : ""}
          </span>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !px-3.5 !py-1.5 !text-[12px]"
            >
              <Github size={13} /> Source <ArrowUpRight size={12} />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost !px-3.5 !py-1.5 !text-[12px]"
            >
              <Globe size={13} /> Live <ArrowUpRight size={12} />
            </a>
          )}
        </div>

        {project.metrics && project.metrics.length > 0 && (
          <div
            className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline bg-line/[0.07]"
            style={{
              gridTemplateColumns: `repeat(${Math.min(project.metrics.length, 4)}, minmax(0, 1fr))`,
            }}
          >
            {project.metrics.map((m) => (
              <div key={m.label} className="bg-surface px-4 py-3.5">
                <div
                  className="font-mono text-base sm:text-lg"
                  style={{ color }}
                >
                  {m.value}
                </div>
                <div className="mt-0.5 text-[11px] text-subtle">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <>
            <p className="eyebrow mt-8">What I built</p>
            <motion.ol
              className="mt-4 space-y-2.5"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.06, delayChildren: 0.15 },
                },
              }}
            >
              {project.highlights.map((h, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="flex gap-4 text-sm leading-relaxed text-fg/85"
                >
                  <span
                    className="font-mono text-xs leading-6"
                    style={{ color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-6">{h}</span>
                </motion.li>
              ))}
            </motion.ol>
          </>
        )}

        <div className="mt-8 flex flex-wrap gap-1.5 border-t hairline pt-6">
          {project.technologies.map((t) => (
            <TechPill key={t} name={t} size="md" />
          ))}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function ProjectCard({
  project,
  size = "md",
  index,
}: {
  project: Project;
  size?: "md" | "lg";
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const reduced = useReducedMotion();
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const rx = useSpring(0, { stiffness: 200, damping: 20 });
  const ry = useSpring(0, { stiffness: 200, damping: 20 });
  const groups = projectGroups(project);
  const primary = groups[0] ?? "ai";
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgb(var(--${primary}) / 0.13), transparent 65%)`;

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
    if (!reduced) {
      rx.set(((e.clientY - r.top) / r.height - 0.5) * -4);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * 4);
    }
  }
  function onLeave() {
    mx.set(-400);
    my.set(-400);
    rx.set(0);
    ry.set(0);
  }

  const metrics = (project.metrics ?? []).slice(0, size === "lg" ? 3 : 2);
  const tech = project.technologies.slice(0, size === "lg" ? 6 : 4);

  return (
    // No entrance animation here: the parent grid owns it, so filtered cards never get stuck hidden
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry }}
        className="card group relative flex h-full flex-col overflow-hidden p-6 transition-colors duration-300 hover:border-line/20"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `linear-gradient(90deg, transparent, rgb(var(--${primary}) / 0.7), transparent)`,
          }}
        />

        {/* Whole-card button sits underneath interactive children */}
        <button
          onClick={() => setOpen(true)}
          className="absolute inset-0 z-0 rounded-2xl"
          aria-label={`Show details for ${project.title}`}
          aria-haspopup="dialog"
        />

        <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 [&>*]:pointer-events-auto">
            {groups.map((g) => (
              <GroupBadge key={g} id={g} />
            ))}
          </div>
          <span className="font-mono text-[11px] text-subtle">
            {index !== undefined
              ? String(index + 1).padStart(2, "0") + " · "
              : ""}
            {project.startDate.replace(
              / \d{4}$/,
              (y) => " '" + y.trim().slice(2),
            )}
          </span>
        </div>

        <div className="pointer-events-none relative z-10 mt-6 flex-1">
          <p className="font-mono text-[11px] text-subtle">{project.context}</p>
          <h3
            className={`mt-2 font-medium tracking-tight ${
              size === "lg"
                ? "text-2xl sm:text-[28px] sm:leading-tight"
                : "text-xl"
            }`}
          >
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {project.description}
          </p>
        </div>

        {metrics.length > 0 && (
          <div
            className="pointer-events-none relative z-10 mt-6 grid gap-px overflow-hidden rounded-xl border hairline bg-line/[0.06]"
            style={{
              gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`,
            }}
          >
            {metrics.map((m) => (
              <div key={m.label} className="bg-surface/90 px-3 py-2.5">
                <div className="font-mono text-sm text-fg">{m.value}</div>
                <div className="mt-0.5 text-[11px] text-subtle">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="pointer-events-none relative z-10 mt-5 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tech.map((t) => (
              <TechPill key={t} name={t} size="sm" />
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full border hairline text-muted transition-colors hover:text-fg"
                aria-label={`${project.title} on GitHub`}
              >
                <Github size={14} />
              </a>
            )}
            <span className="grid h-8 w-8 place-items-center rounded-full border hairline text-muted transition-all duration-300 group-hover:rotate-90 group-hover:text-fg">
              <Plus size={14} />
            </span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && <ProjectDetails project={project} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
