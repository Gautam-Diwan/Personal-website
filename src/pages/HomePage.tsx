import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Rocket,
} from "lucide-react";
import { GROUP_BY_ID, type GroupId } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";
import { playPop } from "../lib/sound";
import { PageContainer } from "../components/ui";
import { TechLogo } from "../components/TechLogo";

/*
 * The five-second page: who I am, what I'm good at (with one number each),
 * where I've worked, and how to reach me, all on one screen. The long-form
 * version lives at /about.
 */

const DOMAINS: { id: GroupId; proof: React.ReactNode }[] = [
  { id: "web", proof: <>Stripe billing for 3k+ users</> },
  { id: "systems", proof: <>Top&nbsp;5 buffer pool on CMU&rsquo;s BusTub</> },
  { id: "ai", proof: <>Agents ~2× faster, 40–50% cheaper</> },
  { id: "ml", proof: <>Diffusion sampling 8× faster</> },
];

const COMPANIES = [
  "RedZone Robotics",
  "Skilly",
  "HCode",
  "KDataScience",
  "NIIT",
];

const CREDENTIALS = [
  { icon: GraduationCap, text: "CMU MSE · 4.14 GPA", short: "CMU · 4.14 GPA" },
  { icon: Rocket, text: "3 early-stage startups", short: "3 startups" },
  {
    icon: MapPin,
    text: "Pittsburgh · open to relocate",
    short: "Open to relocate",
  },
];

const textLink =
  "inline-flex items-center gap-2 text-base font-bold text-fg underline decoration-fg/30 decoration-2 underline-offset-4 hover:decoration-fg";

function Photo() {
  return (
    <motion.figure
      initial={{ opacity: 0, rotate: 4, y: 20 }}
      animate={{ opacity: 1, rotate: -3, y: 0 }}
      transition={{ duration: 0.9, ease, delay: 0.25 }}
      whileHover={{ rotate: 0, scale: 1.015 }}
      className="relative mx-auto hidden w-full max-w-[340px] lg:block"
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
    </motion.figure>
  );
}

function DomainTile({ id, proof }: { id: GroupId; proof: React.ReactNode }) {
  const g = GROUP_BY_ID[id];
  const Icon = g.icon;
  const color = `rgb(var(${g.cssVar}))`;
  return (
    <Link
      to={g.path}
      onClick={() => playPop(1)}
      className="group flex h-full flex-col gap-1.5 rounded-2xl bg-tile p-3.5 transition-transform duration-300 hover:-translate-y-1 sm:p-4"
    >
      <span
        className="flex items-center justify-between gap-2 text-base font-black tracking-tight sm:text-lg"
        style={{ color }}
      >
        <span className="flex items-center gap-2">
          <Icon size={18} strokeWidth={2.5} aria-hidden="true" />
          {id === "ml" || id === "ai" ? g.short : g.label}
        </span>
        <ArrowRight
          size={16}
          className="shrink-0 opacity-50 transition-[opacity,transform] duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
          aria-hidden="true"
        />
      </span>
      <span className="text-[13px] font-semibold leading-snug text-fg sm:text-sm">
        {proof}
      </span>
    </Link>
  );
}

export function HomePage() {
  return (
    <section className="flex min-h-[100svh] items-center overflow-x-clip pb-10 pt-[84px] sm:pb-16 sm:pt-24 lg:pt-[68px]">
      <PageContainer className="grid w-full items-center gap-12 lg:grid-cols-[1.45fr_1fr] lg:gap-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger(0.07, 0.05)}
          className="min-w-0"
        >
          {/* availability: the first thing a recruiter wants to know */}
          <motion.p
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full bg-tile px-3 py-1.5 text-[13px] font-bold text-fg sm:text-sm"
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span
                className="absolute inset-0 animate-ping rounded-full opacity-60"
                style={{ background: "rgb(var(--web))" }}
              />
              <span
                className="relative h-2.5 w-2.5 rounded-full"
                style={{ background: "rgb(var(--web))" }}
              />
            </span>
            Open to full-time software engineering roles
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-4 flex items-center gap-4 sm:mt-5"
          >
            {/* phones and tablets: a face crop instead of the large photo */}
            <span
              data-avatar
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] sm:h-20 sm:w-20 lg:hidden"
              style={{ borderColor: "rgb(var(--accent))" }}
            >
              <span
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/gautam.jpg)",
                  // face sits at ~(35%, 22%) of the portrait; this centres it at 3x zoom
                  backgroundSize: "300% auto",
                  backgroundPosition: "30% 15%",
                }}
                aria-hidden="true"
              />
            </span>
            <h1 className="text-[clamp(2.4rem,7vw,4.4rem)] font-black leading-[1.02] tracking-[-0.03em] text-fg">
              Hi, I&rsquo;m{" "}
              <span style={{ color: "rgb(var(--accent))" }}>Gautam</span>.
            </h1>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-[38rem] text-lg font-bold leading-snug text-fg sm:mt-5 sm:text-2xl sm:leading-snug"
          >
            A product-minded software engineer. I build end to end, from the
            interface to the infrastructure to the AI, and I own the outcome.
          </motion.p>

          <motion.ul
            variants={fadeUp}
            className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 sm:mt-5 sm:gap-x-5"
          >
            {CREDENTIALS.map(({ icon: Icon, text, short }) => (
              <li
                key={text}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted sm:text-[15px]"
              >
                <Icon size={16} aria-hidden="true" className="shrink-0" />
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{text}</span>
              </li>
            ))}
          </motion.ul>

          <motion.ul
            variants={fadeUp}
            className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3 xl:grid-cols-4"
            aria-label="What I work on"
          >
            {DOMAINS.map((d) => (
              <li key={d.id}>
                <DomainTile {...d} />
              </li>
            ))}
          </motion.ul>

          <motion.p
            variants={fadeUp}
            className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted sm:mt-5 sm:text-[15px]"
          >
            <Briefcase size={16} aria-hidden="true" className="shrink-0" />
            <span className="font-semibold">Worked at</span>
            {COMPANIES.map((c, i) => (
              <span key={c} className="font-bold text-fg">
                {c}
                {i < COMPANIES.length - 1 && (
                  <span className="ml-2 font-normal text-subtle">·</span>
                )}
              </span>
            ))}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-8 sm:gap-y-4"
          >
            <a
              href="mailto:gdiwan@cs.cmu.edu"
              onClick={() => playPop(1.1)}
              className="btn-primary"
            >
              <Mail size={18} /> Email me
            </a>
            <Link
              to="/about"
              onClick={() => playPop(1.05)}
              className={textLink}
            >
              More about me <ArrowRight size={16} />
            </Link>
            <a
              href="https://linkedin.com/in/gautamdiwan"
              target="_blank"
              rel="noreferrer"
              className={textLink}
            >
              <Linkedin size={18} style={{ color: "#0A66C2" }} /> LinkedIn
              <ArrowUpRight size={14} className="-ml-1 opacity-60" />
            </a>
            <a
              href="https://github.com/Gautam-Diwan"
              target="_blank"
              rel="noreferrer"
              className={textLink}
            >
              <TechLogo name="GitHub" size={18} /> GitHub
              <ArrowUpRight size={14} className="-ml-1 opacity-60" />
            </a>
          </motion.div>
        </motion.div>

        <Photo />
      </PageContainer>
    </section>
  );
}
