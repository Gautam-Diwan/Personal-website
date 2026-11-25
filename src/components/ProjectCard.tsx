import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Globe, X } from "lucide-react";
import { GroupBadge } from "./ui";
import { TechLogo, TechPill } from "./TechLogo";
import { projectGroups, type Project } from "../lib/content";
import { GROUP_BY_ID } from "../lib/groups";
import { ease, fadeUp } from "../lib/motion";
import { playPop } from "../lib/sound";

const dateRange = (p: Project) =>
  p.endDate && p.endDate !== p.startDate
    ? `${p.startDate} – ${p.endDate}`
    : p.startDate;

/** Full project write-up in a modal panel (no route change). */
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
        className="absolute inset-0 bg-bg/75 backdrop-blur-md"
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
        className="relative max-h-[92svh] w-full max-w-3xl overflow-y-auto rounded-t-[20px] bg-tile p-7 shadow-2xl sm:rounded-[20px] sm:p-10"
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg text-fg transition-colors hover:bg-fg/[0.07]"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-wrap gap-x-4 gap-y-1 pr-12">
          {groups.map((g) => (
            <GroupBadge key={g} id={g} />
          ))}
        </div>
        <p className="mt-6 text-sm font-bold" style={{ color }}>
          {project.context} · {dateRange(project)}
        </p>
        <h2
          id={`project-${project._id}`}
          className="mt-2 text-3xl font-black tracking-tight text-fg sm:text-4xl"
        >
          {project.title}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-fg/90">
          {project.longDescription}
        </p>

        {project.metrics && project.metrics.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-y-6">
            {project.metrics.map((m, i) => (
              <div
                key={m.label}
                className={`pr-6 ${i > 0 ? "border-l hairline pl-6" : ""}`}
              >
                <div className="font-mono text-2xl font-bold" style={{ color }}>
                  {m.value}
                </div>
                <div className="mt-1 text-sm font-semibold text-muted">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <>
            <p
              className="mt-10 text-sm font-extrabold uppercase tracking-[0.14em]"
              style={{ color }}
            >
              What I built
            </p>
            <motion.ol
              className="mt-4 border-t hairline"
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
                  className="flex gap-4 border-b hairline py-4 text-base leading-relaxed text-fg/90"
                >
                  <span
                    className="text-xl font-black leading-6"
                    style={{ color }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{h}</span>
                </motion.li>
              ))}
            </motion.ol>
          </>
        )}

        <p className="mt-10 text-sm font-extrabold uppercase tracking-[0.14em] text-muted">
          Built with
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2.5">
          {project.technologies.map((t) => (
            <TechPill key={t} name={t} size="md" />
          ))}
        </div>

        {(project.githubUrl || project.liveUrl) && (
          <div className="mt-10 flex flex-wrap items-center gap-6">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                onClick={() => playPop(1.1)}
              >
                View source on GitHub <ArrowUpRight size={16} />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <Globe size={17} /> Visit live site
              </a>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/** Project tile in the home page's design language: borderless, bold, plain labels. */
export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  size?: "md" | "lg";
  index?: number;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const groups = projectGroups(project);
  const primary = groups[0] ?? "ai";
  const color = `rgb(var(${GROUP_BY_ID[primary].cssVar}))`;
  const metrics = (project.metrics ?? []).slice(0, 2);
  const tech = project.technologies.slice(0, 4);

  return (
    <div className="h-full">
      <div className="card group relative flex h-full flex-col p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-8">
        {/* Whole-tile button sits underneath the interactive children */}
        <button
          onClick={() => {
            playPop(1.05);
            setOpen(true);
          }}
          className="absolute inset-0 z-0 rounded-[20px]"
          aria-label={`Show details for ${project.title}`}
          aria-haspopup="dialog"
        />

        <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 [&>*]:pointer-events-auto">
            {groups.map((g) => (
              <GroupBadge key={g} id={g} />
            ))}
          </div>
          <span className="shrink-0 text-sm font-semibold text-muted">
            {index !== undefined && (
              <span className="font-black" style={{ color }}>
                {String(index + 1).padStart(2, "0")} ·{" "}
              </span>
            )}
            {project.startDate}
          </span>
        </div>

        <div className="pointer-events-none relative z-10 mt-6 flex-1">
          <p className="text-sm font-bold" style={{ color }}>
            {project.context}
          </p>
          <h3 className="mt-1.5 text-2xl font-black leading-tight tracking-tight text-fg">
            {project.title}
          </h3>
          <p className="mt-3 text-base leading-relaxed text-muted">
            {project.description}
          </p>
        </div>

        {metrics.length > 0 && (
          <div className="pointer-events-none relative z-10 mt-6 flex flex-wrap gap-y-4">
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className={`pr-6 ${i > 0 ? "border-l hairline pl-6" : ""}`}
              >
                <div className="font-mono text-xl font-bold text-fg">
                  {m.value}
                </div>
                <div className="mt-0.5 text-sm text-muted">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="pointer-events-none relative z-10 mt-6 flex flex-wrap gap-x-4 gap-y-2">
          {tech.map((t) => (
            <TechPill key={t} name={t} size="sm" />
          ))}
        </div>

        <div className="pointer-events-none relative z-10 mt-6 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-base font-bold text-fg underline decoration-fg/30 decoration-2 underline-offset-4 transition-colors group-hover:decoration-fg">
            Read more{" "}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </span>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto inline-flex items-center gap-1.5 text-sm font-bold text-fg underline decoration-fg/30 decoration-2 underline-offset-4 hover:decoration-fg"
              aria-label={`${project.title} on GitHub`}
            >
              <TechLogo name="GitHub" size={16} /> Source
            </a>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && <ProjectDetails project={project} onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
