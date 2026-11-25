import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "@tanstack/react-router";
import {
  animate,
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, Linkedin, Mail } from "lucide-react";
import {
  usePortfolio,
  projectsInGroup,
  projectGroups,
  type Project,
} from "../lib/content";
import { GROUPS, GROUP_BY_ID, type GroupId } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";
import { HOME, milesBetween, useVisitorGeo } from "../lib/geo";
import { playPop } from "../lib/sound";
import { PageContainer, Reveal, RevealItem, Skeleton } from "../components/ui";
import { ExperienceTimeline } from "../components/ExperienceTimeline";
import { FeaturedGrid } from "../components/FeaturedGrid";
import { TechLogo } from "../components/TechLogo";
import { useDarkMode } from "../contexts/DarkModeContext";
import { brandColor, iconFor } from "../lib/techIcons";

const LocationMap = lazy(() => import("../components/LocationMap"));

/* ---------- small building blocks ---------- */

/** Inline link to a domain page, colored like that domain (used inside prose). */
function DomainLink({
  id,
  children,
}: {
  id: GroupId;
  children: React.ReactNode;
}) {
  const g = GROUP_BY_ID[id];
  return (
    <Link
      to={g.path}
      onClick={() => playPop(1)}
      className="font-bold underline decoration-2 underline-offset-4 transition-[text-decoration-thickness] hover:decoration-[3px]"
      style={{
        color: `rgb(var(${g.cssVar}))`,
        textDecorationColor: `rgb(var(${g.cssVar}) / 0.45)`,
      }}
    >
      {children}
    </Link>
  );
}

function Heading({
  kicker,
  children,
  color = "--accent",
}: {
  kicker: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Reveal className="mb-8 md:mb-10">
      <RevealItem>
        <p
          className="text-sm font-extrabold uppercase tracking-[0.14em]"
          style={{ color: `rgb(var(${color}))` }}
        >
          {kicker}
        </p>
      </RevealItem>
      <RevealItem>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-fg sm:text-[2.6rem] sm:leading-[1.1]">
          {children}
        </h2>
      </RevealItem>
    </Reveal>
  );
}

/** Hand-drawn squiggle arrow pointing at the photo. */
function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 60"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 50 C 22 10, 40 58, 58 26 S 92 6, 112 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 12 L113 22 L99 30"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const textLink =
  "inline-flex items-center gap-2 text-base font-bold text-fg underline decoration-fg/30 decoration-2 underline-offset-4 hover:decoration-fg";

/* ---------- hero ---------- */

function Hero() {
  return (
    <section className="pb-16 pt-28 md:pb-24 md:pt-36">
      <PageContainer className="grid items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.08, 0.05)}
          className="order-2 lg:order-1"
        >
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,5.2rem)] font-black leading-[1.02] tracking-[-0.03em] text-fg"
          >
            Hi there! I&rsquo;m{" "}
            <span style={{ color: "rgb(var(--accent))" }}>Gautam</span>.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mt-7 max-w-[40rem] space-y-5 text-lg leading-relaxed text-fg/90 sm:text-xl sm:leading-relaxed"
          >
            <p>
              I&rsquo;m an ML systems and AI engineer finishing my{" "}
              <strong className="font-bold text-fg">
                Master of Software Engineering – Scalable Systems
              </strong>{" "}
              at <strong className="font-bold text-fg">Carnegie Mellon</strong>{" "}
              (GPA 4.14 / 4.33), graduating in December 2026.
            </p>
            <p>
              I like making things fast and reliable. That has meant GPU kernels
              and a buffer pool for{" "}
              <DomainLink id="systems">Systems</DomainLink>, training and
              compressing models in <DomainLink id="ml">ML</DomainLink>, LLM
              agents that survive production in{" "}
              <DomainLink id="ai">AI</DomainLink>, and full-stack products on
              the <DomainLink id="web">Web</DomainLink>.
            </p>
            <p className="text-muted">
              Right now I&rsquo;m a Software Developer on a Carnegie Mellon
              practicum with RedZone Robotics, and I&rsquo;m looking for
              full-time ML infrastructure, AI platform, and backend roles.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <a
              href="mailto:gdiwan@cs.cmu.edu"
              onClick={() => playPop(1.1)}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-base font-extrabold transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{
                background: "rgb(var(--accent))",
                color: "rgb(var(--bg))",
              }}
            >
              <Mail size={18} /> Email me
            </a>
            <a
              href="https://github.com/Gautam-Diwan"
              target="_blank"
              rel="noreferrer"
              className={textLink}
            >
              <TechLogo name="GitHub" size={18} /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noreferrer"
              className={textLink}
            >
              <Linkedin size={18} style={{ color: "#0A66C2" }} /> LinkedIn
            </a>
            <a href="#work" className={textLink}>
              See my work <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>

        <motion.figure
          initial={{ opacity: 0, rotate: 4, y: 20 }}
          animate={{ opacity: 1, rotate: -3, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.25 }}
          whileHover={{ rotate: 0, scale: 1.015 }}
          className="relative order-1 mx-auto w-[min(72vw,340px)] lg:order-2 lg:w-full lg:max-w-[420px]"
        >
          <div
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-[10px]"
            style={{ background: "rgb(var(--accent))" }}
            aria-hidden="true"
          />
          <img
            src="/gautam.jpg"
            alt="Gautam Diwan in a suit, smiling, in a Carnegie Mellon atrium"
            width={800}
            height={1000}
            className="relative block aspect-[4/5] w-full rounded-[10px] border-[3px] object-cover"
            style={{ borderColor: "rgb(var(--fg))" }}
          />
          <figcaption
            className="absolute -left-10 bottom-12 hidden -rotate-6 items-center gap-1 font-extrabold sm:flex"
            style={{ color: "rgb(var(--ai))" }}
          >
            <span
              className="rounded-md px-2 py-1 text-base"
              style={{ background: "rgb(var(--bg))" }}
            >
              that&rsquo;s me!
            </span>
            <Squiggle className="h-8 w-16" />
          </figcaption>
        </motion.figure>
      </PageContainer>
    </section>
  );
}

/* ---------- location ---------- */

function Location() {
  const geo = useVisitorGeo();
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px" });
  const miles = geo ? Math.round(milesBetween(HOME, geo)) : null;
  const km = miles !== null ? Math.round(miles * 1.60934) : null;

  return (
    <section className="py-14 md:py-20">
      <PageContainer>
        <Reveal className="max-w-[46rem]">
          <RevealItem>
            <p
              className="text-2xl font-bold leading-snug text-fg sm:text-[1.85rem] sm:leading-snug"
              aria-live="polite"
            >
              {geo === undefined ? (
                <>I&rsquo;m in {HOME.label}.</>
              ) : miles !== null && miles < 25 ? (
                <>
                  I&rsquo;m in {HOME.label}, and according to your IP address,{" "}
                  <span style={{ color: "rgb(var(--accent))" }}>
                    so are you
                  </span>
                  . Coffee?
                </>
              ) : miles !== null ? (
                <>
                  I&rsquo;m in {HOME.label}, roughly{" "}
                  <span style={{ color: "rgb(var(--accent))" }}>
                    {miles.toLocaleString()} miles
                  </span>{" "}
                  {geo?.country && geo.country !== "US" && (
                    <span className="text-muted">
                      ({km!.toLocaleString()} km){" "}
                    </span>
                  )}
                  away from your current location, according to your IP address.
                </>
              ) : (
                <>
                  I&rsquo;m in {HOME.label}, and happy to relocate: San
                  Francisco, New York, and Seattle are all on the table.
                </>
              )}
            </p>
          </RevealItem>
        </Reveal>
        <div ref={ref} className="mt-8 min-h-[200px]">
          {near && geo !== undefined && (
            <Suspense fallback={<Skeleton className="aspect-[96/46] w-full" />}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <LocationMap visitor={geo} />
              </motion.div>
            </Suspense>
          )}
        </div>
        <p className="mt-3 text-sm text-muted">
          Your location is approximate, comes from your IP address via Vercel,
          and is never stored.
        </p>
      </PageContainer>
    </section>
  );
}

/* ---------- stats ---------- */

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
      color: "--accent",
    },
    {
      node: <Counter to={8} suffix="×" />,
      label: "faster image sampling",
      color: "--ml",
    },
    {
      node: <Counter to={50} prefix="~" suffix="%" />,
      label: "less agent runtime",
      color: "--ai",
    },
    {
      node: <Counter to={projectCount} />,
      label: "projects shipped",
      color: "--web",
    },
  ];
  return (
    <PageContainer className="py-12 md:py-16">
      <Reveal className="grid grid-cols-2 gap-y-10 md:grid-cols-4">
        {stats.map((s, i) => (
          <RevealItem
            key={i}
            className={`px-4 md:px-6 ${i % 2 ? "border-l hairline" : ""} ${i === 2 ? "md:border-l" : ""}`}
          >
            <div
              className="text-5xl font-black tracking-tight md:text-6xl"
              style={{ color: `rgb(var(${s.color}))` }}
            >
              {s.node}
            </div>
            <div className="mt-2 text-base font-semibold text-fg">
              {s.label}
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </PageContainer>
  );
}

/* ---------- logo marquee (plain logos, no pills) ---------- */

const MARQUEE = [
  "CUDA",
  "PyTorch",
  "Python",
  "C++",
  "Apache TVM",
  "MLX",
  "Hugging Face",
  "LangGraph",
  "Claude",
  "OpenAI",
  "FastAPI",
  "React",
  "TypeScript",
  "Docker",
  "Kubernetes",
  "Terraform",
  "AWS",
  "GCP",
  "Kafka",
  "Postgres",
  "MongoDB",
  "DuckDB",
  "Polars",
  "Grafana",
  "Go",
];

function Marquee() {
  const { isDark } = useDarkMode();
  return (
    <div className="relative overflow-hidden border-y hairline py-6 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee items-center gap-12 pr-12">
        {[...MARQUEE, ...MARQUEE].map((t, i) => {
          const icon = iconFor(t);
          return (
            <span
              key={i}
              className="flex items-center gap-3 text-lg font-bold"
              style={{ color: icon ? brandColor(icon, isDark) : undefined }}
            >
              <TechLogo name={t} size={26} />
              <span className="text-fg">{t}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- domains as rows ---------- */

function Domains({ projects }: { projects: Project[] }) {
  return (
    <PageContainer className="py-14 md:py-20">
      <div id="work" className="scroll-mt-24" />
      <Heading kicker="Four ways in">What I work on</Heading>
      <Reveal>
        <ul className="border-t hairline">
          {GROUPS.map((g, i) => {
            // Pin-aware ordering: BusTub leads Systems everywhere it is listed
            const list = projectsInGroup(projects, g.id);
            const Icon = g.icon;
            return (
              <RevealItem key={g.id} className="border-b hairline">
                <Link
                  to={g.path}
                  onClick={() => playPop(0.9 + i * 0.08)}
                  className="group grid gap-3 py-7 transition-colors md:grid-cols-[3rem_1.1fr_1.5fr_2rem] md:items-center md:gap-6 md:px-3 md:hover:bg-fg/[0.035]"
                >
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: `rgb(var(${g.cssVar}))` }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <h3
                      className="flex items-center gap-2.5 text-2xl font-black tracking-tight"
                      style={{ color: `rgb(var(${g.cssVar}))` }}
                    >
                      <Icon size={22} /> {g.label}
                    </h3>
                    <p className="mt-1 text-base text-muted">{g.tagline}</p>
                  </div>
                  <p className="text-base leading-relaxed text-fg">
                    {list.slice(0, 3).map((p, j) => (
                      <span key={p._id}>
                        {j > 0 && <span className="text-subtle"> · </span>}
                        <span className={j === 0 ? "font-bold" : ""}>
                          {p.title}
                        </span>
                      </span>
                    ))}
                    {list.length > 3 && (
                      <span className="text-subtle">
                        {" "}
                        · +{list.length - 3} more
                      </span>
                    )}
                  </p>
                  <ArrowRight
                    size={22}
                    className="hidden text-fg transition-transform duration-300 group-hover:translate-x-1 md:block"
                  />
                </Link>
              </RevealItem>
            );
          })}
        </ul>
      </Reveal>
    </PageContainer>
  );
}

/* ---------- selected work as a numbered list ---------- */

function Featured({ projects }: { projects: Project[] }) {
  return (
    <PageContainer className="py-14 md:py-20">
      <Heading kicker="Selected work" color="--ai">
        Things I&rsquo;m proud of
      </Heading>
      <FeaturedGrid projects={projects} />
    </PageContainer>
  );
}

/* ---------- toolkit + education (plain columns) ---------- */

function Toolkit({ skills }: { skills: { category: string; name: string }[] }) {
  const byCat = skills.reduce<Record<string, string[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s.name);
    return acc;
  }, {});
  return (
    <PageContainer className="py-14 md:py-20">
      <Heading kicker="Toolkit" color="--web">
        What I build with
      </Heading>
      <Reveal className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(byCat).map(([cat, items]) => (
          <RevealItem key={cat}>
            <h3 className="border-b hairline pb-2 text-lg font-black text-fg">
              {cat}
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {items.map((s) => (
                <li
                  key={s}
                  className="flex items-center gap-2 text-base font-medium text-fg"
                >
                  {iconFor(s) ? (
                    <TechLogo name={s} size={17} />
                  ) : (
                    <span
                      className="mx-[5px] h-1.5 w-1.5 rounded-full bg-subtle"
                      aria-hidden="true"
                    />
                  )}
                  {s}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </Reveal>
    </PageContainer>
  );
}

function Education() {
  const rows = [
    {
      school: "Carnegie Mellon University",
      degree: "Master of Software Engineering – Scalable Systems",
      meta: "Pittsburgh, PA · GPA 4.14 / 4.33 · Expected December 2026",
      detail:
        "ML Systems (15-642), Diffusion and Flow Matching (10-799, A+), Database Systems (15-645), Machine Learning with Large Datasets (10-805), Software Architectures, DevOps.",
      color: "--accent",
      // Official marks from Wikimedia Commons (public domain); shown on a white plate so the
      // brand colors keep their contrast in dark mode too
      logo: {
        src: "/logos/cmu-wordmark.svg",
        width: 179,
        height: 16,
        h: "h-[18px] sm:h-[22px]",
      },
    },
    {
      school: "Thapar Institute of Engineering and Technology",
      degree: "B.E. Computer Engineering, Conversational AI specialization",
      meta: "Patiala, India · June 2023",
      detail: "NLP, speech processing, data science, and machine learning.",
      color: "--ml",
      logo: {
        src: "/logos/thapar.png",
        width: 800,
        height: 139,
        h: "h-8 sm:h-9",
      },
    },
  ];
  return (
    <PageContainer className="py-14 md:py-20">
      <Heading kicker="Education" color="--ml">
        Where I studied
      </Heading>
      <Reveal className="border-t hairline">
        {rows.map((r) => (
          <RevealItem
            key={r.school}
            className="grid gap-2 border-b hairline py-7 md:grid-cols-[1fr_1.3fr] md:gap-10"
          >
            <div>
              <div className="mb-4 inline-flex items-center rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-black/10">
                <img
                  src={r.logo.src}
                  alt={`${r.school} logo`}
                  width={r.logo.width}
                  height={r.logo.height}
                  loading="lazy"
                  className={`${r.logo.h} w-auto`}
                />
              </div>
              <h3
                className="text-2xl font-black tracking-tight"
                style={{ color: `rgb(var(${r.color}))` }}
              >
                {r.school}
              </h3>
              <p className="mt-1 text-sm font-semibold text-muted">{r.meta}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-fg">{r.degree}</p>
              <p className="mt-1 text-base leading-relaxed text-muted">
                {r.detail}
              </p>
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </PageContainer>
  );
}

function Contact() {
  return (
    <PageContainer className="py-16 md:py-24">
      <Reveal className="max-w-[44rem]">
        <RevealItem>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-fg sm:text-5xl">
            Looking for teams where performance is a{" "}
            <span style={{ color: "rgb(var(--accent))" }}>feature</span>.
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">
            ML infrastructure, AI platform, LLM engineering, or backend roles. I
            graduate in December 2026, I&rsquo;m open to relocating, and my
            inbox is open.
          </p>
        </RevealItem>
        <RevealItem className="mt-8 flex flex-wrap items-center gap-6">
          <a
            href="mailto:gdiwan@cs.cmu.edu"
            onClick={() => playPop(1.1)}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-base font-extrabold transition-transform hover:-translate-y-0.5"
            style={{
              background: "rgb(var(--accent))",
              color: "rgb(var(--bg))",
            }}
          >
            gdiwan@cs.cmu.edu <ArrowUpRight size={17} />
          </a>
          <a
            href="https://linkedin.com/in/gautamdiwan"
            target="_blank"
            rel="noreferrer"
            className={textLink}
          >
            <Linkedin size={18} style={{ color: "#0A66C2" }} /> Connect on
            LinkedIn
          </a>
        </RevealItem>
      </Reveal>
    </PageContainer>
  );
}

/* ---------- page ---------- */

export function HomePage() {
  const { projects, experiences, skills, loading } = usePortfolio();

  return (
    <>
      <Hero />
      <Location />
      <Marquee />
      {loading || !projects || !experiences || !skills ? (
        <PageContainer className="space-y-4 py-20">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </PageContainer>
      ) : (
        <>
          <Stats projectCount={projects.length} />
          <Domains projects={projects} />
          <Featured projects={projects} />
          <PageContainer className="py-14 md:py-20">
            <Heading kicker="Experience" color="--systems">
              Where I&rsquo;ve worked
            </Heading>
            <ExperienceTimeline experiences={experiences} />
          </PageContainer>
          <Toolkit skills={skills} />
          <Education />
          <Contact />
        </>
      )}
    </>
  );
}
