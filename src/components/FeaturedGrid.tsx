import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "../lib/content";
import { ProjectDetails } from "./ProjectCard";
import { TechLogo } from "./TechLogo";
import { playPop } from "../lib/sound";

/*
 * Bento grid of selected work, after the tile grid on joshwcomeau.com/about-josh:
 * a small visual on top, a short first-person sentence, the key number highlighted.
 */

/** Highlighted figure: italic mono in the AI accent, like Josh's "477 miles". */
function Em({ children }: { children: React.ReactNode }) {
  return (
    <em
      className="whitespace-nowrap font-mono font-bold italic"
      style={{ color: "rgb(var(--ai))" }}
    >
      {children}
    </em>
  );
}

function useTicker(ms: number) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setT((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms, reduced]);
  return t;
}

/* ---------- tile visuals ---------- */

function BufferPoolVisual() {
  const t = useTicker(900);
  // Hot pages (pk:root, c:7) stay resident in frames 0-1; frames 2-3 cycle through
  // one-touch scan pages, so every frame always holds a distinct page.
  const scan = ["o:13", "ix:L4", "o:14", "c:2", "o:15", "c:5"];
  const step = Math.floor(t / 2);
  const frames = [
    "pk:root",
    "c:7",
    scan[step % scan.length],
    scan[(step + 3) % scan.length],
  ];
  const hit = t % 2 === 0 ? 0 : 1;
  return (
    <div
      className="grid w-full max-w-md grid-cols-4 gap-1.5 sm:gap-2.5"
      aria-hidden="true"
    >
      {frames.map((p, i) => {
        const hot = i < 2; // resident hot pages sit in T2, scan pages churn through T1
        return (
          <div
            key={i}
            className="rounded-lg border-2 bg-bg px-1 py-2.5 sm:px-2 text-center font-mono transition-colors duration-300"
            style={{
              borderColor:
                i === hit ? "rgb(var(--web))" : "rgb(var(--line) / 0.18)",
            }}
          >
            <div className="text-[11px] text-muted">frame {i}</div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={p}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-1 text-[12px] font-bold text-fg sm:text-sm"
              >
                {p}
              </motion.div>
            </AnimatePresence>
            <div
              className="mt-1 text-[11px] font-bold"
              style={{
                color: hot ? "rgb(var(--systems))" : "rgb(var(--muted))",
              }}
            >
              {hot ? "T2" : "T1"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DenoiseVisual() {
  const t = useTicker(700);
  const steps = [320, 160, 80, 40];
  const active = t % (steps.length + 2);
  return (
    <div className="flex w-full flex-col items-center gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        {steps.map((s, i) => {
          const noise = 1 - i / (steps.length - 1); // 1 → 0
          return (
            <div key={s} className="text-center">
              <div
                className="relative h-24 w-24 overflow-hidden rounded-xl border-2 transition-transform duration-300 sm:h-28 sm:w-28"
                style={{
                  borderColor:
                    i === Math.min(active, 3)
                      ? "rgb(var(--ml))"
                      : "rgb(var(--line) / 0.15)",
                  transform:
                    i === Math.min(active, 3) ? "scale(1.05)" : undefined,
                  background:
                    "radial-gradient(circle at 50% 40%, #f4c7a1 0 22%, transparent 23%), radial-gradient(circle at 50% 95%, #3b4a6b 0 38%, transparent 39%), linear-gradient(160deg, #8ec5ff, #c7a6ff)",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    opacity: noise * 0.92,
                    backgroundImage:
                      "repeating-radial-gradient(circle at 17% 32%, rgba(255,255,255,.9) 0 1px, rgba(0,0,0,.85) 1px 3px), repeating-linear-gradient(37deg, rgba(120,120,120,.9) 0 2px, rgba(20,20,20,.9) 2px 4px)",
                    backgroundBlendMode: "difference",
                  }}
                />
              </div>
              <div className="mt-1.5 font-mono text-xs font-bold text-muted">
                {s} NFE
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GemmVisual() {
  const t = useTicker(120);
  const cols = 8;
  const rows = 5;
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      aria-hidden="true"
    >
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        const wave = Math.sin((x + y) * 0.7 - t * 0.35);
        return (
          <div
            key={i}
            className="h-6 w-6 rounded-[5px] sm:h-7 sm:w-7"
            style={{
              background: `rgb(var(--systems) / ${0.18 + 0.7 * Math.max(0, wave)})`,
            }}
          />
        );
      })}
    </div>
  );
}

function MacsVisual() {
  const t = useTicker(1100);
  const round = t % 3;
  return (
    <div
      className="relative flex w-full max-w-[260px] items-end justify-between"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <motion.div
            className="grid h-14 w-20 place-items-center rounded-md border-2 bg-bg"
            style={{ borderColor: "rgb(var(--line) / 0.35)" }}
            animate={{ y: i === round ? -6 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <TechLogo name="MLX" size={20} />
          </motion.div>
          <div className="h-1.5 w-24 rounded-b-md bg-fg/25" />
          <span className="font-mono text-[11px] font-bold text-muted">
            {["M4 Air", "M4 Pro", "M1 8GB"][i]}
          </span>
        </div>
      ))}
      <motion.span
        key={round}
        className="absolute -top-7 font-mono text-xs font-bold"
        style={{ color: "rgb(var(--ml))", left: `${round * 38 + 6}%` }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ΔLoRA ↑
      </motion.span>
    </div>
  );
}

function PipelineVisual() {
  const t = useTicker(450);
  const lit = t % 8;
  const node = (x: number, y: number, label: string, on: boolean) => (
    <g key={label + x + y}>
      <circle
        cx={x}
        cy={y}
        r={15}
        fill={on ? "rgb(var(--ai))" : "rgb(var(--bg))"}
        stroke="rgb(var(--ai))"
        strokeWidth={2.5}
      />
      <text
        x={x}
        y={y + 4.5}
        textAnchor="middle"
        fontSize={12}
        fontWeight={800}
        fill={on ? "rgb(var(--bg))" : "rgb(var(--fg))"}
      >
        {label}
      </text>
    </g>
  );
  // phases 1-2, fan-out ×3 (phase 3), then 4, 5, 6
  return (
    <svg viewBox="0 0 520 120" className="w-full max-w-lg" aria-hidden="true">
      <g stroke="rgb(var(--line) / 0.3)" strokeWidth={2}>
        <line x1={40} y1={60} x2={120} y2={60} />
        {[20, 60, 100].map((y) => (
          <g key={y}>
            <line x1={120} y1={60} x2={210} y2={y} />
            <line x1={210} y1={y} x2={300} y2={60} />
          </g>
        ))}
        <line x1={300} y1={60} x2={390} y2={60} />
        <line x1={390} y1={60} x2={480} y2={60} />
      </g>
      {node(40, 60, "1", lit === 0)}
      {node(120, 60, "2", lit === 1)}
      {[20, 60, 100].map((y) => node(210, y, "3", lit === 2 || lit === 3))}
      {node(300, 60, "4", lit === 4)}
      {node(390, 60, "5", lit === 5)}
      {node(480, 60, "6", lit === 6 || lit === 7)}
    </svg>
  );
}

function MergedVisual() {
  return (
    <div
      className="w-full max-w-[280px] rounded-xl border-2 bg-bg p-4 font-mono text-sm"
      style={{ borderColor: "rgb(var(--line) / 0.2)" }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 font-bold text-fg">
        <TechLogo name="GitHub" size={18} /> lfnovo/open-notebook
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
          style={{ background: "#8250df" }}
        >
          Merged
        </span>
        <span className="font-bold" style={{ color: "rgb(var(--web))" }}>
          +431
        </span>
        <span className="text-muted">·</span>
        <span className="text-muted">72 tests</span>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="h-2.5 flex-1 rounded-sm"
            style={{ background: i < 9 ? "rgb(var(--web))" : "rgb(var(--ai))" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- tiles ---------- */

type Tile = {
  slug: string;
  span: string;
  visual: React.ReactNode;
  text: React.ReactNode;
  sub?: React.ReactNode;
};

const TILES: Tile[] = [
  {
    slug: "bustub",
    span: "lg:col-span-2",
    visual: <BufferPoolVisual />,
    text: (
      <>
        I built a concurrent buffer pool and ARC replacer for CMU&rsquo;s BusTub
        database that finished <Em>Top 5</Em> on the class leaderboard.
      </>
    ),
    sub: (
      <>
        Plus a B+ tree with optimistic latch crabbing (11th on that
        leaderboard).
      </>
    ),
  },
  {
    slug: "few-step-image-generation",
    span: "lg:row-span-2",
    visual: <DenoiseVisual />,
    text: (
      <>
        I taught a diffusion model to sample in <Em>40 steps instead of 320</Em>
        : 8× faster, and the images got better (FID 26.4 → 22.6).
      </>
    ),
    sub: <>Course grade: A+.</>,
  },
  {
    slug: "blackwell-gemm",
    span: "",
    visual: <GemmVisual />,
    text: (
      <>
        I wrote an FP16 GEMM for NVIDIA Blackwell from scratch, over{" "}
        <Em>10 stages</Em>, chasing cuBLAS.
      </>
    ),
  },
  {
    slug: "macreduce",
    span: "",
    visual: <MacsVisual />,
    text: (
      <>
        I fine-tuned Qwen3 across <Em>3 Macs</Em> with federated QLoRA, taking
        perplexity from <Em>64.2 → 23.3</Em>.
      </>
    ),
  },
  {
    slug: "research-deck-pipeline",
    span: "lg:col-span-2",
    visual: <PipelineVisual />,
    text: (
      <>
        I moved a six-phase research agent from n8n to LangGraph for parallel
        fan-out, <Em>halving runtime</Em> and cutting LLM cost <Em>40–50%</Em>.
      </>
    ),
    sub: <>With checkpoint resume, circuit breakers, and full tracing.</>,
  },
  {
    slug: "open-notebook",
    span: "",
    visual: <MergedVisual />,
    text: (
      <>
        I merged first-class <Em>oMLX</Em> support into Open Notebook, for
        private local inference on Apple Silicon.
      </>
    ),
  },
];

export function FeaturedGrid({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile, i) => {
          const project = bySlug.get(tile.slug);
          if (!project) return null;
          return (
            <motion.button
              key={tile.slug}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
              onClick={() => {
                playPop(1.05);
                setOpen(project);
              }}
              aria-haspopup="dialog"
              aria-label={`${project.title}: show details`}
              className={`group flex flex-col items-center gap-6 rounded-[20px] bg-tile px-6 py-8 text-center transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 sm:px-8 ${tile.span}`}
            >
              <div className="flex min-h-[120px] w-full flex-1 items-center justify-center">
                {tile.visual}
              </div>
              <div className="max-w-[34rem]">
                <p className="text-lg leading-relaxed text-fg sm:text-xl sm:leading-relaxed">
                  {tile.text}
                </p>
                {tile.sub && (
                  <p className="mt-3 text-base text-muted">{tile.sub}</p>
                )}
                <span className="mt-4 inline-block text-base font-bold text-fg underline decoration-fg/35 decoration-2 underline-offset-4 transition-colors group-hover:decoration-fg">
                  {project.title}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {open && <ProjectDetails project={open} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
