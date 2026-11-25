import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePortfolio, projectGroups, projectsInGroup } from "../lib/content";
import { GROUPS, GROUP_BY_ID, type GroupId } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";
import { playPop } from "../lib/sound";
import {
  Heading,
  PageContainer,
  Reveal,
  RevealItem,
  Skeleton,
} from "../components/ui";
import { ProjectCard } from "../components/ProjectCard";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { DiffusionTerminal } from "../components/DiffusionTerminal";
import { TechLogo } from "../components/TechLogo";
import { iconFor } from "../lib/techIcons";
import { QueryPlanViz } from "../components/viz/QueryPlanViz";
import { RecommenderGate } from "../components/viz/RecommenderGate";
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
    body: "A Manim-style walkthrough of collaborative filtering. Sparse ratings are factored into user and item embeddings in ℝ³, trained with SGD on the observed entries only, and each missing rating is predicted as the average rating plus a user·item dot product. The training is real and runs in your browser.",
    node: <RecommenderGate />,
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

/** Bold colored links between the four domains, with a sliding underline on the current one. */
function DomainSwitcher({ current }: { current: GroupId }) {
  return (
    <nav aria-label="Domains" className="flex flex-wrap gap-x-6 gap-y-2">
      {GROUPS.map((g, i) => {
        const active = g.id === current;
        return (
          <Link
            key={g.id}
            to={g.path}
            onClick={() => playPop(0.9 + i * 0.08)}
            aria-current={active ? "page" : undefined}
            className="relative pb-1 text-base font-extrabold transition-opacity hover:opacity-100"
            style={{
              color: `rgb(var(${g.cssVar}))`,
              opacity: active ? 1 : 0.85,
            }}
          >
            {g.label}
            {active && (
              <motion.span
                layoutId="domain-underline"
                className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full"
                style={{ background: `rgb(var(${g.cssVar}))` }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function GroupPage({ groupId }: { groupId: GroupId }) {
  const group = GROUP_BY_ID[groupId];
  const { projects, experiences, loading } = usePortfolio();
  const [filter, setFilter] = useState<string | null>(null);
  const Icon = group.icon;
  const groupIndex = GROUPS.findIndex((g) => g.id === groupId);

  const inGroup = useMemo(
    () => projectsInGroup(projects ?? [], groupId),
    [projects, groupId],
  );
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
  const nextGroup = GROUPS[(groupIndex + 1) % GROUPS.length];
  const color = (a = 1) => `rgb(var(${group.cssVar}) / ${a})`;
  const showcase = SHOWCASES[groupId];

  const stats = [
    { value: inGroup.length, label: "projects" },
    { value: crossover, label: "cross-domain" },
    {
      value: relatedExp.length,
      label: relatedExp.length === 1 ? "related role" : "related roles",
    },
  ].filter((s) => s.value > 0);

  return (
    <div key={groupId}>
      {/* ---------- intro ---------- */}
      <section className="pb-14 pt-28 md:pb-20 md:pt-36">
        <PageContainer>
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger(0.08, 0.05)}
            className="max-w-[46rem]"
          >
            <motion.div variants={fadeUp}>
              <DomainSwitcher current={groupId} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-10 flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em]"
              style={{ color: color() }}
            >
              <Icon size={16} strokeWidth={2.5} /> Domain 0{groupIndex + 1} of
              04
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-3 text-[clamp(2.8rem,7vw,5.2rem)] font-black leading-[1.02] tracking-[-0.03em]"
              style={{ color: color() }}
            >
              {group.label}
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-2xl font-bold leading-snug text-fg sm:text-[1.75rem]"
            >
              {group.tagline}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-lg leading-relaxed text-fg/90 sm:text-xl sm:leading-relaxed"
            >
              {group.description}
            </motion.p>
          </motion.div>

          {!loading && stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.4 }}
              className="mt-12 grid max-w-xl"
              style={{
                gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
              }}
            >
              {stats.map((s, i) => (
                <div
                  key={s.label}
                  className={i > 0 ? "border-l hairline pl-4 sm:pl-8" : "pr-4"}
                >
                  <div
                    className="text-4xl font-black tracking-tight sm:text-5xl"
                    style={{ color: color() }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-fg sm:text-base">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </PageContainer>
      </section>

      {/* ---------- interactive showcase ---------- */}
      {showcase && (
        <section className="py-10 md:py-14">
          <PageContainer>
            {showcase.wide ? (
              <>
                <Heading
                  kicker={showcase.eyebrow}
                  color={group.cssVar}
                  lead={showcase.body}
                >
                  {showcase.title}
                </Heading>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease }}
                >
                  {showcase.node}
                </motion.div>
              </>
            ) : (
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
                <Heading
                  kicker={showcase.eyebrow}
                  color={group.cssVar}
                  lead={showcase.body}
                >
                  {showcase.title}
                </Heading>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, ease }}
                >
                  {showcase.node}
                </motion.div>
              </div>
            )}
          </PageContainer>
        </section>
      )}

      {/* ---------- projects ---------- */}
      <section className="py-14 md:py-20">
        <PageContainer>
          <Heading kicker="Projects" color={group.cssVar}>
            Everything in{" "}
            {group.id === "ml"
              ? "machine learning"
              : group.id === "ai"
                ? "AI"
                : group.label.toLowerCase()}
          </Heading>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80" />
              ))}
            </div>
          ) : (
            <>
              {topTech.length > 0 && (
                <div className="sticky top-[68px] z-30 -mx-4 mb-8 border-b hairline bg-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
                  <div
                    className="flex items-center gap-x-6 gap-y-2 overflow-x-auto pb-1 [scrollbar-width:none]"
                    role="toolbar"
                    aria-label="Filter projects by technology"
                  >
                    <span className="shrink-0 text-sm font-extrabold uppercase tracking-[0.14em] text-muted">
                      Filter
                    </span>
                    {[null, ...topTech].map((t) => {
                      const active = filter === t;
                      return (
                        <button
                          key={t ?? "all"}
                          onClick={() => {
                            playPop(active ? 0.9 : 1.1);
                            setFilter(t);
                          }}
                          aria-pressed={active}
                          className="relative flex shrink-0 items-center gap-1.5 pb-1 text-base font-bold transition-colors"
                          style={{ color: active ? color() : "rgb(var(--fg))" }}
                        >
                          {t && iconFor(t) && <TechLogo name={t} size={16} />}
                          {t ?? `All ${inGroup.length}`}
                          {active && (
                            <motion.span
                              layoutId="tech-filter-underline"
                              className="absolute inset-x-0 -bottom-0.5 h-[3px] rounded-full"
                              style={{ background: color() }}
                              transition={{
                                type: "spring",
                                stiffness: 420,
                                damping: 32,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
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
            </>
          )}
        </PageContainer>
      </section>

      {/* ---------- related experience ---------- */}
      {!loading && relatedExp.length > 0 && (
        <section className="py-14 md:py-20">
          <PageContainer>
            <Heading kicker="In industry" color={group.cssVar}>
              Where I did this at work
            </Heading>
            <ExperienceTimeline experiences={relatedExp} compact />
          </PageContainer>
        </section>
      )}

      {/* ---------- next domain ---------- */}
      <PageContainer className="pb-8 pt-10">
        <Reveal>
          <RevealItem>
            <Link
              to={nextGroup.path}
              onClick={() => playPop(1)}
              className="group grid gap-2 border-y hairline py-10 transition-colors md:grid-cols-[1fr_auto] md:items-center md:px-3 md:hover:bg-fg/[0.035]"
            >
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-muted">
                  Next up
                </p>
                <p
                  className="mt-2 text-4xl font-black tracking-tight md:text-5xl"
                  style={{ color: `rgb(var(${nextGroup.cssVar}))` }}
                >
                  {nextGroup.label}
                </p>
                <p className="mt-2 text-lg text-muted">{nextGroup.tagline}</p>
              </div>
              <ArrowRight
                size={36}
                className="text-fg transition-transform duration-300 group-hover:translate-x-2"
                aria-hidden="true"
              />
            </Link>
          </RevealItem>
        </Reveal>
      </PageContainer>
    </div>
  );
}
