import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Github,
  History,
  Linkedin,
  Mail,
  MapPin,
  Target,
} from "lucide-react";
import { usePortfolio, projectGroups, type Project } from "../lib/content";
import { GROUPS } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";
import {
  PageContainer,
  Reveal,
  RevealItem,
  SectionHeading,
  Skeleton,
} from "../components/ui";
import { ProjectCard } from "../components/ProjectCard";
import { ExperienceTimeline } from "../components/ExperienceTimeline";

const INTERESTS = [
  { id: "systems", label: "Systems", detail: "GPU kernels · databases" },
  { id: "ml", label: "ML", detail: "training · inference" },
  { id: "ai", label: "AI", detail: "LLM agents · RAG" },
  { id: "web", label: "Web", detail: "full-stack products" },
] as const;

const GLANCE = [
  {
    icon: MapPin,
    label: "Based in",
    value: "Pittsburgh, PA",
    note: "Open to relocation (SF, NYC, Seattle)",
  },
  {
    icon: GraduationCap,
    label: "Studying",
    value: "MSE, Scalable Systems · Carnegie Mellon",
    note: "GPA 4.14 / 4.33 · Graduating Dec 2026",
  },
  {
    icon: Briefcase,
    label: "Now",
    value: "Software Developer · RedZone Robotics",
    note: "CMU MSE practicum, 360° video pipeline",
  },
  {
    icon: History,
    label: "Previously",
    value: "AI/ML Intern · Skilly",
    note: "SWE · HCode Technologies, KDataScience",
  },
  {
    icon: Target,
    label: "Looking for",
    value: "ML infra, AI platform, LLM and backend roles",
    note: "Full-time, early-career (L1/L2)",
  },
];

function Hero() {
  return (
    <section className="relative flex min-h-[92svh] items-center pb-16 pt-28 md:pt-36">
      <PageContainer className="grid w-full items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0.1)}
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 rounded-full border hairline bg-surface/80 py-1.5 pl-2.5 pr-4 backdrop-blur"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-web opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-web" />
            </span>
            <span className="text-sm font-medium text-fg">
              Available for full-time roles
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-7 text-[clamp(3rem,8vw,6.25rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-fg"
          >
            Gautam Diwan
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-xl font-medium leading-snug text-fg sm:text-2xl"
          >
            ML Systems &amp; AI Engineer
            <span className="text-muted"> at </span>
            <span className="whitespace-nowrap">Carnegie Mellon</span>
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            I build the infrastructure that makes models fast and agents
            reliable: GPU kernels, distributed training, database internals, and
            production LLM pipelines.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9">
            <p className="eyebrow mb-3">What I work on</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INTERESTS.map((it) => {
                const g = GROUPS.find((x) => x.id === it.id)!;
                const Icon = g.icon;
                return (
                  <Link
                    key={it.id}
                    to={g.path}
                    className="group rounded-xl border px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      borderColor: `rgb(var(${g.cssVar}) / 0.45)`,
                      background: `rgb(var(${g.cssVar}) / 0.1)`,
                    }}
                  >
                    <span
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: `rgb(var(${g.cssVar}))` }}
                    >
                      <Icon size={15} />
                      {it.label}
                      <ArrowRight
                        size={13}
                        className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </span>
                    <span className="mt-1 block text-xs text-fg/85">
                      {it.detail}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a href="#work" className="btn-primary group">
              Explore my work
              <ArrowDown
                size={15}
                className="transition-transform group-hover:translate-y-0.5"
              />
            </a>
            <a href="mailto:gdiwan@cs.cmu.edu" className="btn-ghost">
              <Mail size={15} /> Email
            </a>
            <a
              href="https://github.com/Gautam-Diwan"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <Github size={15} /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <Linkedin size={15} /> LinkedIn
            </a>
          </motion.div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.45 }}
          aria-label="At a glance"
          className="card !bg-surface/90 p-6 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.45)] sm:p-7"
        >
          <div className="flex items-center gap-4 border-b hairline pb-5">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-lg font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, rgb(var(--ai)), rgb(var(--ml)) 55%, rgb(var(--systems)))",
              }}
            >
              GD
            </span>
            <div>
              <p className="text-lg font-semibold text-fg">At a glance</p>
              <p className="text-sm text-muted">Who I am, in five lines</p>
            </div>
          </div>
          <dl className="mt-5 space-y-4">
            {GLANCE.map(({ icon: Icon, label, value, note }) => (
              <div key={label} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-fg/[0.06] text-fg">
                  <Icon size={15} />
                </span>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-subtle">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-[15px] font-medium leading-snug text-fg">
                    {value}
                  </dd>
                  <dd className="text-sm text-muted">{note}</dd>
                </div>
              </div>
            ))}
          </dl>
        </motion.aside>
      </PageContainer>
    </section>
  );
}

const MARQUEE = [
  "CUDA",
  "Apache TVM",
  "PyTorch",
  "MLX",
  "LangGraph",
  "Claude",
  "C++17",
  "MPI",
  "Triton",
  "FastAPI",
  "React 19",
  "three.js",
  "Kubernetes",
  "Terraform",
  "DuckDB",
  "Kafka",
  "Convex",
  "Go",
];

function Marquee() {
  return (
    <div className="relative overflow-hidden border-y hairline bg-surface/30 py-5 backdrop-blur-sm [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {[...MARQUEE, ...MARQUEE].map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-12 font-mono text-sm text-subtle"
          >
            {t}
            <span className="h-1 w-1 rounded-full bg-line/20" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => prefix + v.toFixed(decimals) + suffix);
  useEffect(() => {
    if (!inView) return;
    const c = animate(mv, to, { duration: 1.6, ease });
    return () => c.stop();
  }, [inView, to, mv]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

function Stats({ projectCount }: { projectCount: number }) {
  const stats = [
    {
      node: <Counter to={4.14} decimals={2} />,
      label: "GPA at Carnegie Mellon",
      sub: "out of 4.33",
    },
    {
      node: <Counter to={8} suffix="×" />,
      label: "Faster image sampling",
      sub: "NFE 320 → 40, FID improved",
    },
    {
      node: <Counter to={50} prefix="~" suffix="%" />,
      label: "Agent runtime cut",
      sub: "n8n → LangGraph fan-out",
    },
    {
      node: <Counter to={projectCount} />,
      label: "Projects shipped",
      sub: "across 4 domains",
    },
  ];
  return (
    <PageContainer className="py-14 md:py-20">
      <Reveal className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border hairline bg-line/[0.07] lg:grid-cols-4">
        {stats.map((s, i) => (
          <RevealItem key={i} className="bg-bg/85 p-6 backdrop-blur md:p-8">
            <div className="text-4xl font-medium tracking-tight md:text-5xl">
              {s.node}
            </div>
            <div className="mt-3 text-sm text-fg/90">{s.label}</div>
            <div className="mt-1 font-mono text-[11px] text-subtle">
              {s.sub}
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </PageContainer>
  );
}

function Domains({ projects }: { projects: Project[] }) {
  return (
    <PageContainer className="py-12 md:py-20">
      <div id="work" className="scroll-mt-28" />
      <SectionHeading
        index="01"
        eyebrow="Domains"
        title={
          <>
            Four ways <span className="font-serif italic text-muted">in.</span>
          </>
        }
      >
        Most projects live in more than one place. Pick a lens and every page
        reshapes the scene behind it.
      </SectionHeading>
      <Reveal className="grid gap-4 sm:grid-cols-2">
        {GROUPS.map((g, i) => {
          const inGroup = projects.filter((p) =>
            projectGroups(p).includes(g.id),
          );
          const Icon = g.icon;
          return (
            <RevealItem key={g.id}>
              <Link
                to={g.path}
                className="card group relative block h-full overflow-hidden p-7 transition-all duration-500 hover:-translate-y-1 hover:border-line/20"
              >
                <div
                  className="absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100"
                  style={{ background: `rgb(var(${g.cssVar}) / 0.22)` }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl border transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
                    style={{
                      color: `rgb(var(${g.cssVar}))`,
                      borderColor: `rgb(var(${g.cssVar}) / 0.3)`,
                      background: `rgb(var(${g.cssVar}) / 0.08)`,
                    }}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-[11px] text-subtle">
                    0{i + 1} / {String(inGroup.length).padStart(2, "0")}{" "}
                    projects
                  </span>
                </div>
                <h3 className="relative mt-8 text-2xl font-medium tracking-tight sm:text-3xl">
                  {g.label}
                </h3>
                <p className="relative mt-2 text-sm text-muted">{g.tagline}</p>
                <ul className="relative mt-6 space-y-1.5 border-t hairline pt-5">
                  {inGroup.slice(0, 3).map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center justify-between gap-3 text-sm text-fg/80"
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="shrink-0 font-mono text-[11px] text-subtle">
                        {p.startDate.slice(-4)}
                      </span>
                    </li>
                  ))}
                </ul>
                <span
                  className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: `rgb(var(${g.cssVar}))` }}
                >
                  View{" "}
                  {g.id === "ml" || g.id === "ai"
                    ? g.id.toUpperCase()
                    : g.label.toLowerCase()}{" "}
                  work
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </Reveal>
    </PageContainer>
  );
}

function Featured({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured);
  return (
    <PageContainer className="py-12 md:py-20">
      <SectionHeading
        index="02"
        eyebrow="Selected work"
        title={
          <>
            Things I'm{" "}
            <span className="font-serif italic text-muted">proud of.</span>
          </>
        }
      >
        Measured against a clear bar: cuBLAS, the leaderboard, the bill, or the
        FID score.
      </SectionHeading>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger(0.08)}
        className="grid gap-4 md:grid-cols-6"
      >
        {featured.map((p, i) => {
          // Two large cards up top, then rows of 3 (or 2 if 3 would leave an orphan)
          const restSpan =
            (featured.length - 2) % 3 === 0 ? "md:col-span-2" : "md:col-span-3";
          return (
            <motion.div
              key={p._id}
              variants={fadeUp}
              className={i < 2 ? "md:col-span-3" : restSpan}
            >
              <ProjectCard project={p} size={i < 2 ? "lg" : "md"} />
            </motion.div>
          );
        })}
      </motion.div>
    </PageContainer>
  );
}

function SkillsAndEducation({
  skills,
}: {
  skills: { category: string; name: string }[];
}) {
  const byCat = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s.name);
    return acc;
  }, {});
  return (
    <PageContainer className="py-12 md:py-20">
      <SectionHeading
        index="04"
        eyebrow="Toolkit & education"
        title={
          <>
            The <span className="font-serif italic text-muted">toolkit.</span>
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Reveal className="card grid gap-px overflow-hidden !bg-line/[0.07] sm:grid-cols-2">
          {Object.entries(byCat).map(([cat, items]) => (
            <RevealItem key={cat} className="bg-bg/85 p-6 backdrop-blur">
              <p className="eyebrow mb-4">{cat}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <motion.span
                    key={s}
                    whileHover={{ y: -2 }}
                    className="chip cursor-default !text-fg/80 hover:!text-fg"
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </RevealItem>
          ))}
        </Reveal>
        <Reveal className="flex flex-col gap-4">
          {[
            {
              school: "Carnegie Mellon University",
              degree: "Master of Software Engineering, Scalable Systems",
              meta: "Expected Dec 2026 · GPA 4.14 / 4.33",
              detail:
                "ML Systems (15-642), Diffusion and Flow Matching (10-799, A+), Database Systems (15-645), ML with Large Datasets (10-805), Software Architectures, DevOps.",
            },
            {
              school: "Thapar Institute of Engineering and Technology",
              degree: "B.E. Computer Engineering, Conversational AI",
              meta: "Jun 2023 · Patiala, India",
              detail:
                "NLP, speech processing, data science, and machine learning.",
            },
          ].map((e) => (
            <RevealItem key={e.school} className="card flex-1 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg border hairline text-muted">
                  <GraduationCap size={17} />
                </span>
                <p className="font-mono text-[11px] text-subtle">{e.meta}</p>
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight">
                {e.school}
              </h3>
              <p className="text-sm text-muted">{e.degree}</p>
              <p className="mt-4 text-sm leading-relaxed text-fg/90">
                {e.detail}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </PageContainer>
  );
}

function ContactCTA() {
  return (
    <PageContainer className="pt-16">
      <Reveal>
        <RevealItem className="card relative overflow-hidden px-6 py-16 text-center sm:px-12 md:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(var(--accent)/0.15),transparent_60%)]" />
          <p className="eyebrow">Currently</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl">
            Looking for teams where performance is a{" "}
            <span
              className="font-serif italic"
              style={{ color: "rgb(var(--accent))" }}
            >
              feature.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-muted">
            ML infrastructure, AI platform, LLM engineering, or backend roles.
            Graduating December 2026.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="mailto:gdiwan@cs.cmu.edu" className="btn-primary group">
              Email me{" "}
              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <Linkedin size={15} /> Connect
            </a>
          </div>
        </RevealItem>
      </Reveal>
    </PageContainer>
  );
}

export function HomePage() {
  const { projects, experiences, skills, loading } = usePortfolio();

  return (
    <>
      <Hero />
      <Marquee />
      {loading || !projects || !experiences || !skills ? (
        <PageContainer className="grid gap-4 py-24 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </PageContainer>
      ) : (
        <>
          <Stats projectCount={projects.length} />
          <Domains projects={projects} />
          <Featured projects={projects} />
          <PageContainer className="py-12 md:py-20">
            <SectionHeading
              index="03"
              eyebrow="Experience"
              title={
                <>
                  Where I've{" "}
                  <span className="font-serif italic text-muted">worked.</span>
                </>
              }
            >
              From 500k-user web delivery to RAG phone lines to agent pipelines
              and 360° video rendering.
            </SectionHeading>
            <ExperienceTimeline experiences={experiences} />
          </PageContainer>
          <SkillsAndEducation skills={skills} />
          <ContactCTA />
        </>
      )}
    </>
  );
}
