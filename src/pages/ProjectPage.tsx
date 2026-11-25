import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Calendar, Github, Globe } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { usePortfolio, projectGroups } from "../lib/content";
import { GROUP_BY_ID } from "../lib/groups";
import { fadeUp, stagger } from "../lib/motion";
import { GroupBadge, PageContainer, Reveal, RevealItem, Skeleton } from "../components/ui";
import { ProjectCard } from "../components/ProjectCard";
import { useSetScene } from "../contexts/SceneContext";

export function ProjectPage() {
  const { slug } = useParams({ from: "/projects/$slug" });
  const project = useQuery(api.portfolio.getProjectBySlug, { slug });
  const { projects } = usePortfolio();
  const groups = project ? projectGroups(project) : [];
  const primary = groups[0];
  useSetScene(primary);

  if (project === undefined) {
    return (
      <PageContainer className="space-y-6 pt-40">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-64" />
      </PageContainer>
    );
  }

  if (project === null) {
    return (
      <PageContainer className="pb-20 pt-44 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight">Project not found</h1>
        <Link to="/" className="btn-ghost mt-8">
          <ArrowLeft size={15} /> Back home
        </Link>
      </PageContainer>
    );
  }

  const color = primary ? `rgb(var(${GROUP_BY_ID[primary].cssVar}))` : "rgb(var(--accent))";
  const all = projects ?? [];
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const related = all
    .filter((p) => p.slug !== slug && projectGroups(p).some((g) => groups.includes(g)))
    .map((p) => ({ p, score: projectGroups(p).filter((g) => groups.includes(g)).length }))
    .sort((a, b) => b.score - a.score || (b.p.sortKey ?? 0) - (a.p.sortKey ?? 0))
    .slice(0, 3)
    .map((x) => x.p);

  return (
    <article key={slug}>
      <PageContainer className="pb-12 pt-32 md:pt-40">
        <motion.div initial="hidden" animate="show" variants={stagger(0.07, 0.05)} className="max-w-4xl">
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
            <Link
              to={primary ? GROUP_BY_ID[primary].path : "/"}
              className="group inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
              {primary ? GROUP_BY_ID[primary].label : "Home"}
            </Link>
            <span className="text-subtle">/</span>
            <div className="flex gap-1.5">
              {groups.map((g) => (
                <GroupBadge key={g} id={g} />
              ))}
            </div>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-10 font-mono text-xs" style={{ color }}>
            {project.context}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="mt-4 text-[clamp(2.3rem,6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.03em]"
          >
            {project.title}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-relaxed text-muted md:text-xl">
            {project.description}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
            <span className="chip gap-1.5 !text-xs">
              <Calendar size={12} />
              {project.startDate}
              {project.endDate && project.endDate !== project.startDate ? ` → ${project.endDate}` : ""}
            </span>
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !text-[13px]">
                <Github size={14} /> Source <ArrowUpRight size={13} />
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-ghost !py-2 !text-[13px]">
                <Globe size={14} /> Live <ArrowUpRight size={13} />
              </a>
            )}
          </motion.div>
        </motion.div>
      </PageContainer>

      {project.metrics && project.metrics.length > 0 && (
        <PageContainer className="pb-12">
          <Reveal
            className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-line/[0.07] ${
              project.metrics.length >= 4 ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            {project.metrics.map((m) => (
              <RevealItem key={m.label} className="bg-bg/85 p-6 backdrop-blur md:p-7">
                <div className="font-mono text-xl tracking-tight md:text-[26px] md:leading-tight" style={{ color }}>
                  {m.value}
                </div>
                <div className="mt-2 text-sm text-muted">{m.label}</div>
              </RevealItem>
            ))}
          </Reveal>
        </PageContainer>
      )}

      <PageContainer className="grid gap-12 py-12 lg:grid-cols-[1fr_18rem]">
        <div>
          <Reveal>
            <RevealItem>
              <p className="eyebrow">Overview</p>
              <p className="mt-5 text-lg leading-relaxed text-fg/85">{project.longDescription}</p>
            </RevealItem>
          </Reveal>
          {project.highlights && project.highlights.length > 0 && (
            <Reveal className="mt-14">
              <RevealItem>
                <p className="eyebrow">What I built</p>
              </RevealItem>
              <ol className="mt-6 space-y-3">
                {project.highlights.map((h, i) => (
                  <motion.li key={i} variants={fadeUp} className="card flex gap-5 p-5">
                    <span className="font-mono text-sm" style={{ color }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-relaxed text-fg/85">{h}</span>
                  </motion.li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal className="card p-6">
            <RevealItem>
              <p className="eyebrow">Stack</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.map((t) => (
                  <span key={t} className="chip !text-fg/80">
                    {t}
                  </span>
                ))}
              </div>
            </RevealItem>
            <RevealItem className="mt-6 border-t hairline pt-6">
              <p className="eyebrow">Domains</p>
              <ul className="mt-4 space-y-2">
                {groups.map((g) => (
                  <li key={g}>
                    <Link
                      to={GROUP_BY_ID[g].path}
                      className="group flex items-center justify-between text-sm text-muted transition-colors hover:text-fg"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(var(${GROUP_BY_ID[g].cssVar}))` }} />
                        {GROUP_BY_ID[g].label}
                      </span>
                      <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </RevealItem>
          </Reveal>
        </aside>
      </PageContainer>

      {related.length > 0 && (
        <PageContainer className="pt-16">
          <p className="eyebrow mb-6">Related projects</p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger(0.08)}
            className="grid gap-4 md:grid-cols-3"
          >
            {related.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </motion.div>
        </PageContainer>
      )}

      <PageContainer className="pt-16">
        <div className="grid gap-px overflow-hidden rounded-2xl border hairline bg-line/[0.07] sm:grid-cols-2">
          {[
            { p: prev, label: "Newer", icon: ArrowLeft, align: "left" },
            { p: next, label: "Older", icon: ArrowRight, align: "right" },
          ].map(({ p, label, icon: Icon, align }) =>
            p ? (
              <Link
                key={label}
                to="/projects/$slug"
                params={{ slug: p.slug ?? "" }}
                className={`group bg-bg/85 p-6 backdrop-blur transition-colors hover:bg-surface ${align === "right" ? "sm:text-right" : ""}`}
              >
                <span className={`eyebrow flex items-center gap-2 ${align === "right" ? "sm:justify-end" : ""}`}>
                  {align === "left" && <Icon size={12} />} {label} {align === "right" && <Icon size={12} />}
                </span>
                <span className="mt-2 block text-lg font-medium tracking-tight">{p.title}</span>
              </Link>
            ) : (
              <div key={label} className="bg-bg/85 p-6" />
            ),
          )}
        </div>
      </PageContainer>
    </article>
  );
}
