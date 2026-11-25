import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { buildJoinTrace, simulateArc, type ArcSnapshot } from "./arc";

// 4 frames is small enough that ghost hits occur and ARC's target p visibly adapts
const POOL = 4;
const SYS = (a = 1) => `rgb(var(--systems) / ${a})`;
const RESULT_COLOR = { hit: "--web", miss: "--systems", ghost: "--ml" } as const;

const SQL: [string, string][] = [
  ["SELECT", " c.name, SUM(o.total) AS spend"],
  ["FROM", " orders o JOIN customers c ON o.cust_id = c.id"],
  ["WHERE", " o.placed_at >= '2026-09-01'"],
  ["GROUP BY", " c.name ORDER BY spend DESC LIMIT 5;"],
];

const PLANS = [
  { label: "NestedLoop", detail: "SeqScan(orders) ⋈ SeqScan(customers)", cost: 48210 },
  { label: "HashJoin", detail: "Filter(SeqScan(orders)) ⋈ SeqScan(customers)", cost: 3940 },
  { label: "IndexNLJoin", detail: "IndexScan(placed_at) ⋈ IndexScan(pk)", cost: 1215 },
];
const CHOSEN = 2;

type OpId = "limit" | "sort" | "agg" | "join" | "scanO" | "scanC";
const NODES: { id: OpId; label: string; detail: string; x: number; y: number }[] = [
  { id: "limit", label: "Limit", detail: "5", x: 210, y: 26 },
  { id: "sort", label: "Sort", detail: "spend DESC", x: 210, y: 88 },
  { id: "agg", label: "HashAggregate", detail: "GROUP BY c.name", x: 210, y: 150 },
  { id: "join", label: "IndexNLJoin", detail: "o.cust_id = c.id", x: 210, y: 212 },
  { id: "scanO", label: "IndexScan orders", detail: "placed_at ≥ 2026-09-01", x: 108, y: 292 },
  { id: "scanC", label: "IndexScan customers", detail: "pk = o.cust_id", x: 312, y: 292 },
];
const EDGES: [OpId, OpId][] = [
  ["limit", "sort"],
  ["sort", "agg"],
  ["agg", "join"],
  ["join", "scanO"],
  ["join", "scanC"],
];
const node = (id: OpId) => NODES.find((n) => n.id === id)!;

type Phase = "optimize" | "plan" | "execute" | "done";

function Controls({
  playing,
  onToggle,
  onStep,
  onReset,
}: {
  playing: boolean;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
}) {
  const btn =
    "grid h-8 w-8 place-items-center rounded-lg border hairline text-muted transition-colors hover:bg-fg/5 hover:text-fg";
  return (
    <div className="flex items-center gap-1.5">
      <button className={btn} onClick={onToggle} aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button className={btn} onClick={onStep} aria-label="Step">
        <StepForward size={14} />
      </button>
      <button className={btn} onClick={onReset} aria-label="Restart">
        <RotateCcw size={14} />
      </button>
    </div>
  );
}

export function QueryPlanViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const reduced = useReducedMotion();
  const trace = useMemo(buildJoinTrace, []);
  const snaps = useMemo(() => simulateArc(trace, POOL), [trace]);
  const last = snaps.length - 1;

  const [phase, setPhase] = useState<Phase>("optimize");
  const [optTick, setOptTick] = useState(0); // 0..PLANS.length+1 during optimize
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const reset = () => {
    setPhase("optimize");
    setOptTick(0);
    setStep(0);
    setPlaying(true);
  };

  const advance = () => {
    if (phase === "optimize") {
      if (optTick < PLANS.length + 1) setOptTick((t) => t + 1);
      else setPhase("plan");
    } else if (phase === "plan") setPhase("execute");
    else if (phase === "execute") {
      if (step < last) setStep((s) => s + 1);
      else setPhase("done");
    }
  };

  useEffect(() => {
    if (reduced) {
      setOptTick(PLANS.length + 1);
      setStep(last);
      setPhase("done");
      setPlaying(false);
    }
  }, [reduced, last]);

  useEffect(() => {
    if (!inView || !playing || phase === "done") return;
    const ms = phase === "optimize" ? 650 : phase === "plan" ? 1100 : 520;
    const t = window.setTimeout(advance, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, playing, phase, optTick, step]);

  const snap: ArcSnapshot = snaps[step];
  const executed = trace.slice(0, step);
  const rowsO = executed.reduce((n, a) => n + (a.tuples ?? 0), 0);
  const rowsJoin = executed.filter((a) => a.joined).length;
  const groups = new Set(executed.filter((a) => a.joined).map((a) => a.page)).size;
  const stats = snaps.slice(1, step + 1).reduce(
    (acc, s) => {
      acc[s.result!]++;
      if (s.evicted) acc.evictions++;
      return acc;
    },
    { hit: 0, miss: 0, ghost: 0, evictions: 0 },
  );
  const done = phase === "done";
  const rows: Record<OpId, number | string> = {
    scanO: rowsO,
    scanC: rowsJoin,
    join: rowsJoin,
    agg: done ? groups : "…",
    sort: done ? groups : "·",
    limit: done ? 5 : "·",
  };
  const activeOp: OpId | null =
    phase === "execute" && snap.access ? (snap.access.op === "scanC" ? "scanC" : "scanO") : done ? "limit" : null;
  const showTree = phase !== "optimize";
  const log = snaps.slice(Math.max(1, step - 4), step + 1).reverse();
  const listOf = (page: string) => (snap.T2.includes(page) ? "T2" : "T1");

  return (
    <div ref={ref} className="card overflow-hidden !bg-surface/85">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {(["optimize", "plan", "execute"] as const).map((p, i) => {
            const order = ["optimize", "plan", "execute", "done"];
            const reached = order.indexOf(phase) >= i;
            const current = phase === p || (p === "execute" && done);
            return (
              <span
                key={p}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors"
                style={{
                  color: reached ? SYS() : "rgb(var(--subtle))",
                  borderColor: current ? SYS(0.45) : "rgb(var(--line) / var(--line-alpha))",
                  background: current ? SYS(0.1) : "transparent",
                }}
              >
                {i + 1}. {p}
              </span>
            );
          })}
        </div>
        <Controls
          playing={playing && !done}
          onToggle={() => (done ? reset() : setPlaying((p) => !p))}
          onStep={() => {
            setPlaying(false);
            advance();
          }}
          onReset={reset}
        />
      </div>

      <div className="grid lg:grid-cols-[1.05fr_1fr]">
        {/* Left: SQL, optimizer, plan */}
        <div className="border-b hairline p-5 lg:border-b-0 lg:border-r">
          <pre className="overflow-x-auto rounded-xl border hairline bg-bg/60 p-4 font-mono text-[11.5px] leading-6">
            {SQL.map(([kw, rest]) => (
              <div key={kw}>
                <span style={{ color: SYS() }}>{kw}</span>
                <span className="text-fg/80">{rest}</span>
              </div>
            ))}
          </pre>

          <p className="eyebrow mb-3 mt-5">Optimizer · candidate plans</p>
          <ul className="space-y-1.5">
            {PLANS.map((plan, i) => {
              const costed = optTick > i;
              const picked = optTick > PLANS.length && i === CHOSEN;
              const width = costed ? (Math.log10(plan.cost) / Math.log10(PLANS[0].cost)) * 100 : 0;
              return (
                <li
                  key={plan.label}
                  className="relative overflow-hidden rounded-lg border px-3 py-2 font-mono text-[11px] transition-colors duration-500"
                  style={{
                    borderColor: picked ? SYS(0.5) : "rgb(var(--line) / var(--line-alpha))",
                    opacity: optTick > PLANS.length && !picked ? 0.45 : 1,
                  }}
                >
                  <motion.span
                    className="absolute inset-y-0 left-0"
                    style={{ background: SYS(picked ? 0.16 : 0.07) }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  <span className="relative flex items-center justify-between gap-3">
                    <span className="truncate">
                      <span className="text-fg">{plan.label}</span>
                      <span className="text-subtle"> · {plan.detail}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5" style={{ color: costed ? SYS() : undefined }}>
                      {costed ? `cost ${plan.cost.toLocaleString()}` : "costing…"}
                      {picked && <Check size={12} />}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="eyebrow mb-1 mt-6">Physical plan</p>
          <svg viewBox="0 0 420 320" className="w-full" role="img" aria-label="Query plan tree">
            {EDGES.map(([a, b]) => {
              const A = node(a);
              const B = node(b);
              const flowing = showTree && activeOp !== null && (b === activeOp || (activeOp === "scanC" && b === "join") || (activeOp === "scanO" && b === "join"));
              return (
                <g key={a + b}>
                  <motion.line
                    x1={A.x}
                    y1={A.y + 18}
                    x2={B.x}
                    y2={B.y - 18}
                    stroke="rgb(var(--line) / 0.18)"
                    strokeWidth={1.2}
                    initial={false}
                    animate={{ pathLength: showTree ? 1 : 0 }}
                    transition={{ duration: 0.6 }}
                  />
                  {flowing && phase === "execute" && (
                    <motion.circle
                      key={`${a}${b}${step}`}
                      r={3}
                      fill={SYS()}
                      initial={{ cx: B.x, cy: B.y - 18, opacity: 1 }}
                      animate={{ cx: A.x, cy: A.y + 18, opacity: 0.2 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  )}
                </g>
              );
            })}
            {NODES.map((n, i) => {
              const active = activeOp === n.id || (activeOp && activeOp.startsWith("scan") && n.id === "join");
              return (
                <motion.g
                  key={n.id}
                  initial={false}
                  animate={{ opacity: showTree ? 1 : 0, y: showTree ? 0 : 8 }}
                  transition={{ duration: 0.4, delay: showTree ? (NODES.length - i) * 0.08 : 0 }}
                >
                  <rect
                    x={n.x - 92}
                    y={n.y - 18}
                    width={184}
                    height={36}
                    rx={9}
                    fill="rgb(var(--bg))"
                    stroke={active ? SYS(0.9) : "rgb(var(--line) / 0.16)"}
                    strokeWidth={active ? 1.5 : 1}
                    style={{ transition: "stroke 0.2s" }}
                  />
                  <text x={n.x - 82} y={n.y - 3} className="font-mono" fontSize={10.5} fill="rgb(var(--fg))">
                    {n.label}
                  </text>
                  <text x={n.x - 82} y={n.y + 10} className="font-mono" fontSize={9} fill="rgb(var(--subtle))">
                    {n.detail}
                  </text>
                  <text x={n.x + 84} y={n.y + 4} textAnchor="end" className="font-mono" fontSize={10} fill={SYS()}>
                    {showTree && phase !== "plan" ? rows[n.id] : ""}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* Right: buffer pool */}
        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">Buffer pool · ARC · {POOL} frames</p>
            <span className="font-mono text-[11px] text-subtle">
              access {step}/{last}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {snap.frames.map((page, i) => {
              const touched = phase === "execute" && snap.frame === i && snap.result;
              const color = touched ? `rgb(var(${RESULT_COLOR[snap.result!]}))` : undefined;
              return (
                <div
                  key={i}
                  className="relative h-[68px] overflow-hidden rounded-xl border hairline bg-bg/60 p-2.5 font-mono"
                  style={touched ? { borderColor: color, boxShadow: `0 0 0 1px ${color}` } : undefined}
                >
                  <div className="flex items-center justify-between text-[9.5px] text-subtle">
                    <span>frame {i}</span>
                    {page && (
                      <span
                        className="rounded px-1"
                        style={{
                          color: listOf(page) === "T2" ? SYS() : "rgb(var(--muted))",
                          background: listOf(page) === "T2" ? SYS(0.12) : "rgb(var(--fg) / 0.05)",
                        }}
                      >
                        {listOf(page)}
                      </span>
                    )}
                  </div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={page ?? "empty"}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`mt-2 text-[13px] ${page ? "text-fg" : "text-subtle/60"}`}
                    >
                      {page ?? "empty"}
                    </motion.div>
                  </AnimatePresence>
                  {touched && (
                    <motion.span
                      key={`flash${step}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0.35 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{ background: color }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 font-mono text-[10.5px]">
            {(
              [
                ["T1 recent", snap.T1, true],
                ["T2 frequent", snap.T2, true],
                ["B1 ghost", snap.B1, false],
                ["B2 ghost", snap.B2, false],
              ] as const
            ).map(([label, list, live]) => (
              <div key={label} className="flex items-start gap-2">
                <span className="w-[76px] shrink-0 pt-0.5 text-subtle">{label}</span>
                <div className="flex min-h-[20px] flex-wrap gap-1">
                  {list.map((pg) => (
                    <motion.span
                      key={pg}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="rounded px-1.5 py-0.5"
                      style={
                        live
                          ? { color: label.startsWith("T2") ? SYS() : "rgb(var(--fg) / 0.8)", background: label.startsWith("T2") ? SYS(0.12) : "rgb(var(--fg) / 0.06)" }
                          : { color: "rgb(var(--subtle))", border: "1px dashed rgb(var(--line) / 0.2)" }
                      }
                    >
                      {pg}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <span className="w-[76px] shrink-0 text-subtle">target p</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line/10">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: SYS() }}
                  animate={{ width: `${(snap.p / POOL) * 100}%` }}
                />
              </span>
              <span className="w-8 text-right text-fg">{snap.p.toFixed(1)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl border hairline bg-line/[0.07] font-mono">
            {[
              ["hits", stats.hit, "--web"],
              ["misses", stats.miss, "--systems"],
              ["ghost", stats.ghost, "--ml"],
              ["hit rate", step ? `${Math.round((stats.hit / step) * 100)}%` : "–", "--fg"],
            ].map(([k, v, c]) => (
              <div key={k as string} className="bg-surface px-3 py-2">
                <div className="text-sm" style={{ color: `rgb(var(${c}))` }}>
                  {v}
                </div>
                <div className="text-[10px] text-subtle">{k}</div>
              </div>
            ))}
          </div>

          <ul className="mt-4 h-[118px] space-y-1 overflow-hidden font-mono text-[10.5px]">
            {phase !== "optimize" &&
              phase !== "plan" &&
              log.map((s, i) =>
                s.access ? (
                  <motion.li
                    key={`${s.access.page}-${snaps.indexOf(s)}`}
                    initial={i === 0 ? { opacity: 0, x: -8 } : false}
                    animate={{ opacity: 1 - i * 0.18, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-2"
                  >
                      <span className="w-12 uppercase" style={{ color: `rgb(var(${RESULT_COLOR[s.result!]}))` }}>
                        {s.result}
                      </span>
                      <span className="text-fg/80">{s.access.page}</span>
                      <span className="text-subtle">→ frame {s.frame}</span>
                      {s.evicted && <span className="text-subtle">· evict {s.evicted}</span>}
                    </motion.li>
                  ) : null,
                )}
            {(phase === "optimize" || phase === "plan") && (
              <li className="text-subtle">waiting for the executor to request pages…</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
