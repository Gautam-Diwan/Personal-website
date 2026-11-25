import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TechLogo } from "../TechLogo";
import { ease } from "../../lib/motion";

const MIN_LOADER_MS = 1900;

// The heavy three.js + training chunk only downloads once the visitor opts in
const loadViz = () =>
  Promise.all([
    import("./MatrixFactorizationViz"),
    new Promise((r) => setTimeout(r, MIN_LOADER_MS)),
  ]).then(([m]) => ({ default: m.MatrixFactorizationViz }));

const M = {
  blue: "#58C4DD",
  yellow: "#F7D96F",
  green: "#83C167",
  red: "#FC6255",
  teal: "#5CD0B3",
  dim: "#A6A6A6",
};
const CELL_COLORS = [M.red, M.yellow, M.dim, M.teal, M.green]; // ratings 1..5

const QUIPS = [
  "Asking 6 users about 8 movies…",
  "Hiding the ratings you haven't seen…",
  "Factorizing taste into ℝ³…",
  "Bribing SGD to converge…",
  "Computing a few hundred dot products…",
  "Rolling credits on the loss curve…",
];

/** A ratings grid that keeps flipping between "?" and colored guesses while the viz loads. */
function FunkyLoader() {
  const [tick, setTick] = useState(0);
  const [quip, setQuip] = useState(0);
  useEffect(() => {
    const a = setInterval(() => setTick((t) => t + 1), 140);
    const b = setInterval(() => setQuip((q) => (q + 1) % QUIPS.length), 650);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  const cells = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const h = Math.sin(i * 12.9898 + tick * 0.7) * 43758.5453;
        const r = h - Math.floor(h);
        return r < 0.35 ? null : 1 + (Math.floor(r * 5) % 5);
      }),
    [tick],
  );
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[420px] flex-col items-center justify-center gap-7 rounded-2xl border border-white/15 bg-black px-6 py-10 text-white"
      role="status"
      aria-live="polite"
    >
      <motion.p
        className="font-serif text-4xl italic"
        animate={{ rotate: [-2, 2, -2], scale: [1, 1.04, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        R ≈ UV<sup className="text-2xl">ᵀ</sup>
      </motion.p>
      <div className="grid grid-cols-8 gap-1.5" style={{ perspective: 600 }}>
        {cells.map((v, i) => (
          <motion.div
            key={`${i}-${v ?? "q"}`}
            initial={{ rotateX: 90, opacity: 0.2 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="grid h-9 w-9 place-items-center rounded-md font-serif text-lg sm:h-10 sm:w-10"
            style={{
              background: v
                ? `${CELL_COLORS[v - 1]}26`
                : "rgba(255,255,255,0.05)",
              color: v ? CELL_COLORS[v - 1] : M.dim,
              border: `1px solid ${v ? `${CELL_COLORS[v - 1]}66` : "rgba(255,255,255,0.15)"}`,
            }}
          >
            {v ?? "?"}
          </motion.div>
        ))}
      </div>
      <div className="h-7 text-center font-serif text-xl">
        <AnimatePresence mode="wait">
          <motion.span
            key={quip}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            {QUIPS[quip]}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="h-2 w-64 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${M.blue}, ${M.teal}, ${M.yellow})`,
          }}
          initial={{ width: "4%" }}
          animate={{ width: "96%" }}
          transition={{ duration: MIN_LOADER_MS / 1000, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

export function RecommenderGate() {
  const [state, setState] = useState<"ask" | "open">("ask");
  const reduced = useReducedMotion();
  const Viz = useMemo(() => (state === "open" ? lazy(loadViz) : null), [state]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "ask" ? (
        <motion.div
          key="ask"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          transition={{ duration: 0.4, ease }}
          className="card mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-10 text-center sm:px-10"
        >
          <motion.div
            animate={reduced ? undefined : { y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="grid h-16 w-16 place-items-center rounded-2xl bg-black shadow-[0_12px_40px_-8px_rgba(229,9,20,0.55)]"
          >
            <TechLogo name="Netflix" size={30} />
          </motion.div>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              Ever wondered how Netflix decides what you&rsquo;ll watch next?
            </p>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted">
              A classic answer is matrix factorization. I can train one in front
              of you, in 3D, from a handful of ratings to predictions for the
              shows nobody rated yet.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setState("open")}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: "rgb(var(--ml))", color: "rgb(var(--bg))" }}
            >
              Yes, show me
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
            <span className="text-sm text-muted">
              ~25 s animation · trains live in your browser
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="open"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<FunkyLoader />}>{Viz && <Viz />}</Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
