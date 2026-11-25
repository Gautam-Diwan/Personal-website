import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";
import { usePortfolio, projectGroups } from "../lib/content";
import { GROUPS, GROUP_BY_ID, type GroupId } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";
import { PageContainer, SectionHeading, Skeleton } from "../components/ui";
import { ProjectCard } from "../components/ProjectCard";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { DiffusionTerminal } from "../components/DiffusionTerminal";
import { QueryPlanViz } from "../components/viz/QueryPlanViz";
import { MatrixFactorizationViz } from "../components/viz/MatrixFactorizationViz";
import { RequestFlowViz } from "../components/viz/RequestFlowViz";

type Showcase = {
  eyebrow: string;
  title: string;
  body: string;
  node: React.ReactNode;
  wide?: boolean;
};

const SHOWCASES: Partial<Record<GroupId, Showcase>> = {
  systems: {
    eyebrow: "Under the hood",
    title: "From SQL to pages in memory.",
    body: "Run the query to watch the optimizer cost three plans and pick an index nested-loop join. Every page the executor touches then goes through a 4-frame buffer pool managed by ARC, the replacement policy I built for BusTub. Hot customer pages earn a place in T2, revisited heap pages compete through T1, and the target p shifts each time a ghost list proves one side wrong.",
    node: <QueryPlanViz />,
    wide: true,
  },
  ml: {
    eyebrow: "Under the hood",
    title: "Matrix factorization, trained in front of you.",
    body: "A Manim-style walkthrough of collaborative filtering. Sparse ratings are factored into user and item embeddings in ℝ³, trained with SGD on the observed entries only, and the missing ratings fall out as dot products. The training is real and runs in your browser.",
    node: <MatrixFactorizationViz />,
    wide: true,
  },
  web: {
    eyebrow: "Under the hood",
    title: "Follow a request through the stack.",
    body: "The architecture from my Cloud Bookstore CQRS platform. Reads and writes take different paths, writes emit Kafka events, a CronJob keeps the Mongo read model in sync, and recommendations are guarded by a circuit breaker. Take the recs service down and watch the breaker trip, fall back, and recover.",
    node: <RequestFlowViz />,
    wide: true,
  },
  ai: {
    eyebrow: "Try it",
    title: "Ask me something.",
    body: "This answer renders like a masked text diffusion model: every token starts as noise and is refined in parallel over denoising steps, instead of being written left to right one token at a time.",
    node: <DiffusionTerminal />,
  },
};

export function GroupPage({ groupId }: { groupId: GroupId }) {
  const group = GROUP_BY_ID[groupId];
  const { projects, experiences, loading } = usePortfolio();
  const [filter, setFilter] = useState<string | null>(null);
  const Icon = group.icon;

  const inGroup = useMemo(() => {
    const pinned = group.pinned ?? [];
    const rank = (slug?: string) => {
      const i = pinned.indexOf(slug ?? "");
      return i === -1 ? pinned.length : i;
    };
    // Stable sort keeps recency order for everything that is not pinned
    return (projects ?? [])
      .filter((p) => projectGroups(p).includes(groupId))
      .sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [projects, groupId, group.pinned]);
  const topTech = useMemo(() => {
    const counts = new Map<string, number>();
    inGroup.forEach((p) =>
      p.technologies.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
    );
    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const shared = ranked.filter(([, c]) => c > 1);
    // Small groups share few technologies; fall back to the most common singles
    return (shared.length >= 4 ? shared : ranked).slice(0, 8).map(([t]) => t);
  }, [inGroup]);
  const shown = filter
    ? inGroup.filter((p) => p.technologies.includes(filter))
    : inGroup;
  const relatedExp = (experiences ?? []).filter((e) =>
    (e.groups ?? []).includes(groupId),
  );
  const crossover = inGroup.filter((p) => projectGroups(p).length > 1).length;
  const nextGroup =
    GROUPS[(GROUPS.findIndex((g) => g.id === groupId) + 1) % GROUPS.length];
  const color = (a = 1) => `rgb(var(${group.cssVar}) / ${a})`;
  const showcase = SHOWCASES[groupId];

  return (
    <div key={groupId}>
      <section className="relative pb-16 pt-36 md:pb-24 md:pt-44">
        <PageContainer>
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger(0.08, 0.1)}
            className="max-w-3xl"
          >
            <motion.nav
              variants={fadeUp}
              className="mb-10 flex flex-wrap gap-2"
              aria-label="Domains"
            >
              <LayoutGroup id="group-switch">
                {GROUPS.map((g) => {
                  const active = g.id === groupId;
                  return (
                    <Link
                      key={g.id}
                      to={g.path}
                      className={`relative rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                        active
                          ? "border-transparent"
                          : "hairline text-muted hover:text-fg"
                      }`}
                      style={
                        active ? { color: `rgb(var(${g.cssVar}))` } : undefined
                      }
                    >
                      {active && (
                        <motion.span
                          layoutId="group-pill"
                          className="absolute inset-0 rounded-full border"
                          style={{
                            borderColor: `rgb(var(${g.cssVar}) / 0.4)`,
                            background: `rgb(var(${g.cssVar}) / 0.1)`,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 34,
                          }}
                        />
                      )}
                      <span className="relative">{g.label}</span>
                    </Link>
                  );
                })}
              </LayoutGroup>
            </motion.nav>

            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl border"
                style={{
                  color: color(),
                  borderColor: color(0.3),
                  background: color(0.08),
                }}
              >
                <Icon size={19} />
              </span>
              <span className="eyebrow" style={{ color: color() }}>
                {group.short} · {inGroup.length || "··"} projects
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-[clamp(2.6rem,7vw,5.2rem)] font-medium leading-[0.98] tracking-[-0.035em]"
            >
              {group.label}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-4 font-serif text-2xl italic text-muted sm:text-3xl"
            >
              {group.tagline}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl leading-relaxed text-muted"
            >
              {group.description}
            </motion.p>
            {!loading && (
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-6 font-mono text-[12px] text-subtle"
              >
                <span>
                  <span className="text-fg">{inGroup.length}</span> projects
                </span>
                {crossover > 0 && (
                  <span>
                    <span className="text-fg">{crossover}</span> cross-domain
                  </span>
                )}
                {relatedExp.length > 0 && (
                  <span>
                    <span className="text-fg">{relatedExp.length}</span> related{" "}
                    {relatedExp.length === 1 ? "role" : "roles"}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </PageContainer>
      </section>

      {showcase && (
        <PageContainer className="-mt-4 mb-20 md:-mt-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.4 }}
            className={
              showcase.wide
                ? "space-y-6"
                : "grid items-center gap-8 lg:grid-cols-[1fr_1.4fr]"
            }
          >
            <div className={showcase.wide ? "max-w-2xl" : ""}>
              <p className="eyebrow" style={{ color: color() }}>
                {showcase.eyebrow}
              </p>
              <p className="mt-3 text-2xl font-medium tracking-tight">
                {showcase.title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {showcase.body}
              </p>
            </div>
            {showcase.node}
          </motion.div>
        </PageContainer>
      )}

      <PageContainer>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <>
            {topTech.length > 0 && (
              <div className="sticky top-20 z-30 -mx-4 mb-8 px-4 py-3 sm:-mx-6 sm:px-6">
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {[null, ...topTech].map((t) => {
                    const active = filter === t;
                    return (
                      <button
                        key={t ?? "all"}
                        onClick={() => setFilter(t)}
                        className={`relative shrink-0 rounded-full border px-3 py-1.5 font-mono text-[11px] backdrop-blur-md transition-colors ${
                          active
                            ? "border-transparent text-bg"
                            : "hairline bg-bg/60 text-muted hover:text-fg"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="tech-filter"
                            className="absolute inset-0 rounded-full"
                            style={{ background: color() }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 34,
                            }}
                          />
                        )}
                        <span className="relative">
                          {t ?? `All (${inGroup.length})`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {shown.map((p, i) => (
                  <motion.div
                    key={p._id}
                    layout="position"
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                      transition: { duration: 0.2 },
                    }}
                    transition={{
                      duration: 0.4,
                      ease,
                      delay: Math.min(i, 8) * 0.04,
                    }}
                  >
                    <ProjectCard project={p} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {relatedExp.length > 0 && (
              <section className="mt-28">
                <SectionHeading
                  eyebrow="In industry"
                  title={
                    <>
                      Related{" "}
                      <span className="font-serif italic text-muted">
                        experience.
                      </span>
                    </>
                  }
                >
                  Roles where {group.label.toLowerCase()} work was part of the
                  job.
                </SectionHeading>
                <ExperienceTimeline experiences={relatedExp} compact />
              </section>
            )}

            <Link
              to={nextGroup.path}
              className="card group mt-28 flex items-center justify-between gap-6 overflow-hidden p-8 transition-colors hover:border-line/20 md:p-10"
            >
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Layers size={12} /> Next domain
                </p>
                <p className="mt-3 text-3xl font-medium tracking-tight md:text-4xl">
                  {nextGroup.label}
                </p>
                <p className="mt-1 text-sm text-muted">{nextGroup.tagline}</p>
              </div>
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full border transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-45"
                style={{
                  color: `rgb(var(${nextGroup.cssVar}))`,
                  borderColor: `rgb(var(${nextGroup.cssVar}) / 0.35)`,
                }}
              >
                <ArrowRight size={20} />
              </span>
            </Link>
          </>
        )}
      </PageContainer>
    </div>
  );
}
