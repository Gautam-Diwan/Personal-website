import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { GroupBadge } from "./ui";
import { projectGroups, type Project } from "../lib/content";
import { fadeUp } from "../lib/motion";

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
    <motion.div variants={fadeUp} layout style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry }}
        className="card group relative flex h-full flex-col overflow-hidden p-6 transition-colors duration-300 hover:border-line/20"
      >
        <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: spotlight }} />
        <div
          className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, rgb(var(--${primary}) / 0.7), transparent)` }}
        />

        {/* Whole-card link sits underneath interactive children */}
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug ?? "" }}
          className="absolute inset-0 z-0"
          aria-label={`Read more about ${project.title}`}
        />

        <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 [&>*]:pointer-events-auto">
            {groups.map((g) => (
              <GroupBadge key={g} id={g} />
            ))}
          </div>
          <span className="font-mono text-[11px] text-subtle">
            {index !== undefined ? String(index + 1).padStart(2, "0") + " · " : ""}
            {project.startDate.replace(/ \d{4}$/, (y) => " '" + y.trim().slice(2))}
          </span>
        </div>

        <div className="pointer-events-none relative z-10 mt-6 flex-1">
          <p className="font-mono text-[11px] text-subtle">{project.context}</p>
          <h3
            className={`mt-2 font-medium tracking-tight transition-colors ${
              size === "lg" ? "text-2xl sm:text-[28px] sm:leading-tight" : "text-xl"
            }`}
          >
            {project.title}
            <ArrowUpRight
              size={18}
              className="ml-1 inline-block -translate-x-1 translate-y-0.5 text-subtle opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:-translate-y-0 group-hover:text-fg group-hover:opacity-100"
            />
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>
        </div>

        {metrics.length > 0 && (
          <div
            className="pointer-events-none relative z-10 mt-6 grid gap-px overflow-hidden rounded-xl border hairline bg-line/[0.06]"
            style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }}
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
              <span key={t} className="chip !py-0.5">
                {t}
              </span>
            ))}
          </div>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto grid h-8 w-8 shrink-0 place-items-center rounded-full border hairline text-muted transition-colors hover:text-fg"
              aria-label={`${project.title} on GitHub`}
            >
              <Github size={14} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
