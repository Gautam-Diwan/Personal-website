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
  CalendarDays,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { TechLogo, TechPill } from "../components/TechLogo";
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
  { id: "systems", label: "Systems", detail: "kernels · DBs" },
  { id: "ml", label: "ML", detail: "training · inference" },
  { id: "ai", label: "AI", detail: "agents · RAG" },
  { id: "web", label: "Web", detail: "full-stack" },
] as const;

const FACTS = [
  {
    icon: MapPin,
    text: "Pittsburgh, PA",
    sub: "open to relocation",
    color: "--web",
  },
  {
    icon: GraduationCap,
    text: "MSE, Carnegie Mellon",
    sub: "GPA 4.14 / 4.33",
    color: "--ai",
  },
  {
    icon: Briefcase,
    text: "Software Developer",
    sub: "RedZone Robotics",
    color: "--systems",
  },
  {
    icon: CalendarDays,
    text: "Graduating Dec 2026",
    sub: "full-time, L1/L2",
    color: "--ml",
  },
];

/** Portrait with a rotating gradient ring; falls back to a monogram until /gautam.jpg exists. */
function Avatar() {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative h-36 w-36 sm:h-40 sm:w-40">
      <div
        className="absolute -inset-[5px] animate-[spin_9s_linear_infinite] rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgb(var(--ai)), rgb(var(--ml)), rgb(var(--systems)), rgb(var(--web)), rgb(var(--ai)))",
        }}
      />
      <div className="absolute -inset-[1px] rounded-full bg-bg" />
      {failed ? (
        <div
          className="relative grid h-full w-full place-items-center rounded-full font-mono text-4xl font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, rgb(var(--ai)), rgb(var(--ml)) 55%, rgb(var(--systems)))",
          }}
          aria-label="Gautam Diwan"
          role="img"
        >
          GD
        </div>
      ) : (
        <img
          src="/gautam.jpg"
          alt="Portrait of Gautam Diwan"
          width={160}
          height={160}
          onError={() => setFailed(true)}
          className="relative h-full w-full rounded-full object-cover"
        />
      )}
      <span
        className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full border-[3px] border-bg bg-web"
        title="Available for full-time roles"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-web opacity-50" />
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[94svh] items-center pb-14 pt-28 md:pt-32">
      <PageContainer className="w-full">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0.1)}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <Avatar />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-7 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-sm font-semibold"
            style={{
              color: "rgb(var(--web))",
              borderColor: "rgb(var(--web) / 0.45)",
              background: "rgb(var(--web) / 0.1)",
            }}
          >
            <span className="h-2 w-2 rounded-full bg-web" />
            Available for full-time roles
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-[clamp(3rem,9vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-fg"
          >
            Gautam Diwan
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-xl font-semibold sm:text-2xl"
          >
            <span style={{ color: "rgb(var(--systems))" }}>ML Systems</span>
            <span className="text-fg"> &amp; </span>
            <span style={{ color: "rgb(var(--ai))" }}>AI Engineer</span>
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
          >
            I build the infrastructure that makes models fast and agents
            reliable: GPU kernels, distributed training, database internals, and
            production LLM pipelines.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {FACTS.map(({ icon: Icon, text, sub, color }) => (
              <li
                key={text}
                className="card flex flex-col items-center gap-1 px-3 py-3.5 !bg-surface/85"
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full"
                  style={{
                    color: `rgb(var(${color}))`,
                    background: `rgb(var(${color}) / 0.14)`,
                  }}
                >
                  <Icon size={16} />
                </span>
                <span className="mt-1 text-sm font-semibold leading-tight text-fg">
                  {text}
                </span>
                <span className="text-xs text-muted">{sub}</span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            variants={fadeUp}
            className="mt-7 flex flex-wrap justify-center gap-2"
          >
            {INTERESTS.map((it) => {
              const g = GROUPS.find((x) => x.id === it.id)!;
              const Icon = g.icon;
              return (
                <Link
                  key={it.id}
                  to={g.path}
                  className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    borderColor: `rgb(var(${g.cssVar}) / 0.5)`,
                    background: `rgb(var(${g.cssVar}) / 0.12)`,
                  }}
                >
                  <Icon size={15} style={{ color: `rgb(var(${g.cssVar}))` }} />
                  <span
                    className="font-semibold"
                    style={{ color: `rgb(var(${g.cssVar}))` }}
                  >
                    {it.label}
                  </span>
                  <span className="text-fg/90">{it.detail}</span>
                  <ArrowRight
                    size={13}
                    className="text-fg transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              );
            })}
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap justify-center gap-3"
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
              <TechLogo name="GitHub" size={15} /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <Linkedin size={15} style={{ color: "#0A66C2" }} /> LinkedIn
            </a>
          </motion.div>
        </motion.div>
      </PageContainer>
    </section>
  );
}

const MARQUEE_ROWS = [
  [
    "CUDA",
    "PyTorch",
    "Python",
    "C++",
    "Apache TVM",
    "MLX",
    "Hugging Face",
    "NumPy",
    "Polars",
    "DuckDB",
    "Modal",
    "FFmpeg",
  ],
  [
    "LangGraph",
    "Claude",
    "OpenAI",
    "FastAPI",
    "React",
    "TypeScript",
    "Next.js",
    "Docker",
    "Kubernetes",
    "Terraform",
    "AWS",
    "GCP",
    "Kafka",
    "Postgres",
    "MongoDB",
    "Redis",
    "Grafana",
    "Go",
  ],
];

function Marquee() {
  return (
    <div className="relative space-y-3 overflow-hidden border-y hairline bg-surface/40 py-5 backdrop-blur-sm [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      {MARQUEE_ROWS.map((row, r) => (
        <div
          key={r}
          className="flex w-max animate-marquee gap-3 pr-3"
          style={{
            animationDirection: r % 2 ? "reverse" : "normal",
            animationDuration: r % 2 ? "60s" : "50s",
          }}
        >
          {[...row, ...row].map((t, i) => (
            <TechPill key={i} name={t} size="lg" />
          ))}
        </div>
      ))}
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
      color: "--ai",
    },
    {
      node: <Counter to={8} suffix="×" />,
      label: "Faster image sampling",
      sub: "NFE 320 → 40, FID improved",
      color: "--ml",
    },
    {
      node: <Counter to={50} prefix="~" suffix="%" />,
      label: "Agent runtime cut",
      sub: "n8n → LangGraph fan-out",
      color: "--systems",
    },
    {
      node: <Counter to={projectCount} />,
      label: "Projects shipped",
      sub: "across 4 domains",
      color: "--web",
    },
  ];
  return (
    <PageContainer className="py-14 md:py-20">
      <Reveal className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <RevealItem
            key={i}
            className="relative overflow-hidden rounded-2xl border p-6 text-center md:p-7"
            style={{
              borderColor: `rgb(var(${s.color}) / 0.4)`,
              background: `rgb(var(${s.color}) / 0.08)`,
            }}
          >
            <span
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: `rgb(var(${s.color}))` }}
            />
            <div
              className="text-4xl font-semibold tracking-tight md:text-5xl"
              style={{ color: `rgb(var(${s.color}))` }}
            >
              {s.node}
            </div>
            <div className="mt-3 text-sm font-semibold text-fg">{s.label}</div>
            <div className="mt-1 font-mono text-xs text-muted">{s.sub}</div>
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
        center
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
        center
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
        center
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
                    className="cursor-default"
                  >
                    <TechPill name={s} size="md" />
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
              center
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
