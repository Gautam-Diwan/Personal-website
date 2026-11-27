import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  Check,
  Database,
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from "lucide-react";
import { buildJoinTrace, simulateArc, type ArcSnapshot } from "./arc";
import { BPlusTreeViz } from "./BPlusTreeViz";
import { ease } from "../../lib/motion";

// 4 frames is small enough that ghost hits occur and ARC's target p visibly adapts
const POOL = 4;
const SYS = (a = 1) => `rgb(var(--systems) / ${a})`;
const RESULT_COLOR = {
  hit: "--web",
  miss: "--systems",
  ghost: "--ml",
} as const;

const SQL: [string, string][] = [
  ["SELECT", " c.name, SUM(o.total) AS spend"],
  ["FROM", " orders o JOIN customers c ON o.cust_id = c.id"],
  ["WHERE", " o.placed_at >= '2026-09-01'"],
  ["GROUP BY", " c.name"],
  ["ORDER BY", " spend DESC LIMIT 5;"],
];
const SQL_LEN = SQL.reduce((n, [k, r]) => n + k.length + r.length, 0);

const PLANS = [
  {
    label: "NestedLoop",
    detail: "SeqScan(orders) ⋈ SeqScan(customers)",
    cost: 48210,
  },
  {
    label: "HashJoin",
    detail: "Filter(SeqScan(orders)) ⋈ SeqScan(customers)",
    cost: 3940,
  },
  {
    label: "IndexNLJoin",
    detail: "IndexScan(placed_at) ⋈ IndexScan(pk)",
    cost: 1215,
  },
];
const CHOSEN = 2;

type OpId = "limit" | "sort" | "agg" | "join" | "scanO" | "scanC";
const NODES: {
  id: OpId;
  label: string;
  detail: string;
  x: number;
  y: number;
}[] = [
  { id: "limit", label: "Limit", detail: "5", x: 210, y: 26 },
  { id: "sort", label: "Sort", detail: "spend DESC", x: 210, y: 88 },
  {
    id: "agg",
    label: "HashAggregate",
    detail: "GROUP BY c.name",
    x: 210,
    y: 150,
  },
  {
    id: "join",
    label: "IndexNLJoin",
    detail: "o.cust_id = c.id",
    x: 210,
    y: 212,
  },
  {
    id: "scanO",
    label: "IndexScan orders",
    detail: "placed_at ≥ 2026-09-01",
    x: 108,
    y: 292,
  },
  {
    id: "scanC",
    label: "IndexScan customers",
    detail: "pk = o.cust_id",
    x: 312,
    y: 292,
  },
];
const EDGES: [OpId, OpId][] = [
  ["limit", "sort"],
  ["sort", "agg"],
  ["agg", "join"],
  ["join", "scanO"],
  ["join", "scanC"],
];
const node = (id: OpId) => NODES.find((n) => n.id === id)!;

type Phase = "query" | "optimize" | "plan" | "execute" | "done";
const ORDER: Phase[] = ["query", "optimize", "plan", "execute", "done"];

/** SQL with keyword highlighting, truncated to `shown` characters for the typing effect. */
function SqlText({ shown }: { shown: number }) {
  let left = shown;
  return (
    <>
      {SQL.map(([kw, rest]) => {
        const k = kw.slice(0, Math.max(0, left));
        left -= kw.length;
        const r = rest.slice(0, Math.max(0, left));
        left -= rest.length;
        if (!k) return null;
        return (
          <div key={kw}>
            <span className="font-semibold" style={{ color: SYS() }}>
              {k}
            </span>
            <span className="text-fg">{r}</span>
          </div>
        );
      })}
    </>
  );
}

const iconBtn =
  "grid h-8 w-8 place-items-center rounded-lg border hairline text-muted transition-colors hover:bg-fg/5 hover:text-fg";

export function QueryPlanViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const reduced = useReducedMotion();
  const trace = useMemo(buildJoinTrace, []);
  const snaps = useMemo(() => simulateArc(trace, POOL), [trace]);
  const last = snaps.length - 1;

  const [phase, setPhase] = useState<Phase>("query");
  const [typed, setTyped] = useState(0);
  const [optTick, setOptTick] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  const expanded = phase !== "query";
  const done = phase === "done";

  const run = () => {
    setTyped(SQL_LEN);
    setOptTick(0);
    setStep(0);
    setPhase("optimize");
    setPlaying(true);
  };
  const restart = () => {
    setPhase("query");
    setTyped(0);
    setOptTick(0);
    setStep(0);
    setPlaying(true);
  };

  const advance = () => {
    if (phase === "query") {
      // Type the query in, then wait: execution only starts when the visitor clicks Run
      if (typed < SQL_LEN) setTyped((t) => Math.min(SQL_LEN, t + 3));
    } else if (phase === "optimize") {
      if (optTick < PLANS.length + 1) setOptTick((t) => t + 1);
      else setPhase("plan");
    } else if (phase === "plan") setPhase("execute");
    else if (phase === "execute") {
      if (step < last) setStep((s) => s + 1);
      else setPhase("done");
    }
  };

  useEffect(() => {
    if (reduced) setTyped(SQL_LEN);
  }, [reduced]);

  // Reduced motion: Run jumps straight to the finished execution
  useEffect(() => {
    if (!reduced || phase !== "optimize") return;
    setOptTick(PLANS.length + 1);
    setStep(last);
    setPhase("done");
    setPlaying(false);
  }, [reduced, phase, last]);

  useEffect(() => {
    if (!inView || !playing || done) return;
    if (phase === "query" && typed >= SQL_LEN) return;
    const ms =
      phase === "query"
        ? typed < SQL_LEN
          ? 28
          : 1600
        : phase === "optimize"
          ? 650
          : phase === "plan"
            ? 1300
            : 560;
    const t = window.setTimeout(advance, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, playing, phase, typed, optTick, step]);

  const snap: ArcSnapshot = snaps[step];
  // Most recent step (≤ current) where p moved, so the explanation stays readable between changes
  const lastPChange = (() => {
    for (let s = step; s > 0; s--) {
      const d = snaps[s].p - snaps[s - 1].p;
      if (d !== 0) return { step: s, delta: d };
    }
    return null;
  })();
  const pDelta = lastPChange?.delta ?? 0;
  const pFresh = lastPChange?.step === step;
  const executed = trace.slice(0, step);
  const rowsO = executed.reduce((n, a) => n + (a.tuples ?? 0), 0);
  const rowsJoin = executed.filter((a) => a.joined).length;
  const groups = new Set(executed.filter((a) => a.joined).map((a) => a.page))
    .size;
  const stats = snaps.slice(1, step + 1).reduce(
    (acc, s) => {
      acc[s.result!]++;
      return acc;
    },
    { hit: 0, miss: 0, ghost: 0 },
  );
  const rows: Record<OpId, number | string> = {
    scanO: rowsO,
    scanC: rowsJoin,
    join: rowsJoin,
    agg: done ? groups : "…",
    sort: done ? groups : "·",
    limit: done ? 5 : "·",
  };
  const activeOp: OpId | null =
    phase === "execute" && snap.access ? snap.access.op : done ? "limit" : null;
  const showTree = phase === "plan" || phase === "execute" || done;
  const executing = phase === "execute" || done;
  const log = snaps.slice(Math.max(1, step - 4), step + 1).reverse();
  const listOf = (page: string) => (snap.T2.includes(page) ? "T2" : "T1");

  return (
    <LayoutGroup>
      <motion.div
        ref={ref}
        layout
        transition={{ layout: { duration: 0.7, ease } }}
        className={`card mx-auto overflow-hidden ${expanded ? "w-full" : "w-full max-w-2xl"}`}
      >
        {/* Header */}
        <motion.div
          layout="position"
          className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-5 py-3.5"
        >
          {expanded ? (
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {(["optimize", "plan", "execute"] as const).map((p, i) => {
                const reached = ORDER.indexOf(phase) >= ORDER.indexOf(p);
                const current = phase === p || (p === "execute" && done);
                return (
                  <span
                    key={p}
                    className="rounded-full border px-2.5 py-1 font-medium transition-colors"
                    style={{
                      color: reached ? SYS() : "rgb(var(--subtle))",
                      borderColor: current
                        ? SYS(0.6)
                        : "rgb(var(--line) / var(--line-alpha))",
                      background: current ? SYS(0.12) : "transparent",
                    }}
                  >
                    {i + 1}. {p}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="flex items-center gap-2 font-mono text-xs font-medium text-muted">
              <Database size={14} style={{ color: SYS() }} /> bookstore=#
              query.sql
            </span>
          )}
          {expanded ? (
            <div className="flex items-center gap-1.5">
              <button
                className={iconBtn}
                onClick={() => (done ? run() : setPlaying((p) => !p))}
                aria-label={playing && !done ? "Pause" : "Play"}
              >
                {playing && !done ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                className={iconBtn}
                onClick={() => {
                  setPlaying(false);
                  advance();
                }}
                aria-label="Step"
              >
                <StepForward size={14} />
              </button>
              <button
                className={iconBtn}
                onClick={restart}
                aria-label="Back to the query"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={run}
              className="relative flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-xs font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: SYS(), color: "rgb(var(--bg))" }}
            >
              {typed >= SQL_LEN && (
                <motion.span
                  className="absolute inset-0 rounded-lg"
                  style={{ boxShadow: `0 0 0 0 ${SYS(0.6)}` }}
                  animate={{
                    boxShadow: [`0 0 0 0 ${SYS(0.55)}`, `0 0 0 10px ${SYS(0)}`],
                  }}
                  transition={{ repeat: Infinity, duration: 1.3 }}
                />
              )}
              <Play size={13} /> Run EXPLAIN ANALYZE
            </button>
          )}
        </motion.div>

        <div
          className={
            expanded
              ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
              : ""
          }
        >
          {/* Left column: SQL, optimizer, plan */}
          <div
            className={
              expanded
                ? "min-w-0 border-b hairline p-4 sm:p-5 lg:border-b-0 lg:border-r"
                : "p-5 sm:p-7"
            }
          >
            <motion.pre
              layoutId="sql-block"
              transition={{ duration: 0.7, ease }}
              className={`overflow-x-auto whitespace-pre-wrap break-words rounded-xl border hairline bg-bg font-mono ${
                expanded
                  ? "p-3 text-[11px] leading-5 sm:p-4 sm:text-[12px] sm:leading-6"
                  : "min-h-[190px] p-5 text-[14px] leading-7 sm:text-[15px]"
              }`}
            >
              <SqlText shown={typed} />
              {!expanded && typed < SQL_LEN && (
                <span
                  className="inline-block h-4 w-2 translate-y-0.5 animate-pulse"
                  style={{ background: SYS() }}
                />
              )}
            </motion.pre>
            {!expanded && (
              <p className="mt-4 text-sm text-muted">
                Top 5 customers by spend since September. Run it to see how the
                database plans the query and which pages it pulls into memory.
              </p>
            )}

            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
              >
                <p className="eyebrow mb-3 mt-6">Optimizer · candidate plans</p>
                <ul className="space-y-1.5">
                  {PLANS.map((plan, i) => {
                    const costed = optTick > i;
                    const picked = optTick > PLANS.length && i === CHOSEN;
                    const rejected = optTick > PLANS.length && !picked;
                    const width = costed
                      ? (Math.log10(plan.cost) / Math.log10(PLANS[0].cost)) *
                        100
                      : 0;
                    return (
                      <li
                        key={plan.label}
                        className="relative overflow-hidden rounded-lg border px-3 py-2 font-mono text-xs transition-colors duration-500"
                        style={{
                          borderColor: picked
                            ? SYS(0.7)
                            : "rgb(var(--line) / var(--line-alpha))",
                        }}
                      >
                        <motion.span
                          className="absolute inset-y-0 left-0"
                          style={{ background: SYS(picked ? 0.2 : 0.09) }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                        <span className="relative flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <span
                            className={`min-w-0 break-words ${rejected ? "line-through decoration-1" : ""}`}
                          >
                            <span className="font-semibold text-fg">
                              {plan.label}
                            </span>
                            <span className="text-muted"> · {plan.detail}</span>
                          </span>
                          <span
                            className="flex shrink-0 items-center gap-1.5 font-medium"
                            style={{
                              color: costed ? SYS() : "rgb(var(--subtle))",
                            }}
                          >
                            {costed
                              ? `cost ${plan.cost.toLocaleString()}`
                              : "costing…"}
                            {picked && <Check size={13} />}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <p className="eyebrow mb-1 mt-6">Physical plan</p>
                <svg
                  viewBox="0 0 420 320"
                  className="w-full"
                  role="img"
                  aria-label="Query plan tree"
                >
                  {EDGES.map(([a, b]) => {
                    const A = node(a);
                    const B = node(b);
                    const flowing =
                      phase === "execute" &&
                      activeOp !== null &&
                      (b === activeOp || b === "join");
                    return (
                      <g key={a + b}>
                        <motion.line
                          x1={A.x}
                          y1={A.y + 18}
                          x2={B.x}
                          y2={B.y - 18}
                          stroke="rgb(var(--line) / 0.3)"
                          strokeWidth={1.4}
                          initial={false}
                          animate={{ pathLength: showTree ? 1 : 0 }}
                          transition={{ duration: 0.6 }}
                        />
                        {flowing && (
                          <motion.circle
                            key={`${a}${b}${step}`}
                            r={3.5}
                            fill={SYS()}
                            initial={{ cx: B.x, cy: B.y - 18, opacity: 1 }}
                            animate={{ cx: A.x, cy: A.y + 18, opacity: 0.25 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                          />
                        )}
                      </g>
                    );
                  })}
                  {NODES.map((n, i) => {
                    const active =
                      activeOp === n.id ||
                      (activeOp?.startsWith("scan") && n.id === "join");
                    return (
                      <motion.g
                        key={n.id}
                        initial={false}
                        animate={{
                          opacity: showTree ? 1 : 0,
                          y: showTree ? 0 : 8,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: showTree ? (NODES.length - i) * 0.08 : 0,
                        }}
                      >
                        <rect
                          x={n.x - 94}
                          y={n.y - 19}
                          width={188}
                          height={38}
                          rx={9}
                          fill="rgb(var(--bg))"
                          stroke={active ? SYS() : "rgb(var(--line) / 0.28)"}
                          strokeWidth={active ? 2 : 1}
                          style={{ transition: "stroke 0.2s" }}
                        />
                        <text
                          x={n.x - 84}
                          y={n.y - 3}
                          className="font-mono"
                          fontSize={11}
                          fontWeight={600}
                          fill="rgb(var(--fg))"
                        >
                          {n.label}
                        </text>
                        <text
                          x={n.x - 84}
                          y={n.y + 11}
                          className="font-mono"
                          fontSize={9.5}
                          fill="rgb(var(--muted))"
                        >
                          {n.detail}
                        </text>
                        <text
                          x={n.x + 86}
                          y={n.y + 4}
                          textAnchor="end"
                          className="font-mono"
                          fontSize={11}
                          fontWeight={600}
                          fill={SYS()}
                        >
                          {executing ? rows[n.id] : ""}
                        </text>
                      </motion.g>
                    );
                  })}
                </svg>
              </motion.div>
            )}
          </div>

          {/* Right column: buffer pool */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.6, ease, delay: 0.6 }}
                className="min-w-0 p-4 sm:p-5"
              >
                <div className="flex items-baseline justify-between">
                  <p className="eyebrow">Buffer pool · ARC · {POOL} frames</p>
                  <span className="font-mono text-xs text-muted">
                    access {step}/{last}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {snap.frames.map((page, i) => {
                    const touched =
                      phase === "execute" && snap.frame === i && snap.result;
                    const color = touched
                      ? `rgb(var(${RESULT_COLOR[snap.result!]}))`
                      : undefined;
                    return (
                      <div
                        key={i}
                        className="relative h-[70px] overflow-hidden rounded-xl border hairline bg-bg p-2.5 font-mono"
                        style={
                          touched
                            ? {
                                borderColor: color,
                                boxShadow: `0 0 0 1px ${color}`,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center justify-between text-[10.5px] text-muted">
                          <span>frame {i}</span>
                          {page && (
                            <span
                              className="rounded px-1 font-semibold"
                              style={{
                                color:
                                  listOf(page) === "T2"
                                    ? SYS()
                                    : "rgb(var(--fg))",
                                background:
                                  listOf(page) === "T2"
                                    ? SYS(0.15)
                                    : "rgb(var(--fg) / 0.08)",
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
                            className={`mt-2 text-sm font-medium ${page ? "text-fg" : "text-subtle"}`}
                          >
                            {page ?? "empty"}
                          </motion.div>
                        </AnimatePresence>
                        {touched && (
                          <motion.span
                            key={`flash${step}`}
                            className="absolute inset-0"
                            initial={{ opacity: 0.3 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ background: color }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 font-mono text-[11px]">
                  {(
                    [
                      ["T1 recent", snap.T1, "live"],
                      ["T2 frequent", snap.T2, "hot"],
                      ["B1 ghost", snap.B1, "ghost"],
                      ["B2 ghost", snap.B2, "ghost"],
                    ] as const
                  ).map(([label, list, kind]) => (
                    <div key={label} className="flex items-start gap-2">
                      <span className="w-[82px] shrink-0 pt-0.5 text-muted">
                        {label}
                      </span>
                      <div className="flex min-h-[22px] flex-wrap gap-1">
                        {list.map((pg) => (
                          <motion.span
                            key={pg}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="rounded px-1.5 py-0.5 font-medium"
                            style={
                              kind === "hot"
                                ? { color: SYS(), background: SYS(0.15) }
                                : kind === "live"
                                  ? {
                                      color: "rgb(var(--fg))",
                                      background: "rgb(var(--fg) / 0.08)",
                                    }
                                  : {
                                      color: "rgb(var(--muted))",
                                      border:
                                        "1px dashed rgb(var(--line) / 0.35)",
                                    }
                            }
                          >
                            {pg}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-lg border hairline p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-[74px] shrink-0 text-muted">
                        target p
                      </span>
                      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-fg/10">
                        <motion.span
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{ background: SYS() }}
                          animate={{ width: `${(snap.p / POOL) * 100}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 160,
                            damping: 20,
                          }}
                        />
                      </span>
                      <span className="w-14 text-right text-sm font-semibold text-fg">
                        {snap.p.toFixed(1)}
                        <span className="text-muted">/{POOL}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 min-h-[18px] pl-[82px] text-[11px] leading-snug">
                      <AnimatePresence mode="wait">
                        {executing && lastPChange && (
                          <motion.span
                            key={lastPChange.step}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={pFresh ? "font-semibold" : "font-medium"}
                            style={{
                              color: pFresh
                                ? "rgb(var(--ml))"
                                : "rgb(var(--muted))",
                            }}
                          >
                            {!pFresh && `@${lastPChange.step} `}
                            {pDelta > 0
                              ? `p +${pDelta.toFixed(1)} · B1 ghost hit, favor recency (grow T1)`
                              : `p ${pDelta.toFixed(1)} · B2 ghost hit, favor frequency (grow T2)`}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-xl border hairline bg-line/[0.1] font-mono">
                  {[
                    ["hits", stats.hit, "--web"],
                    ["misses", stats.miss, "--systems"],
                    ["ghost hits", stats.ghost, "--ml"],
                    [
                      "hit rate",
                      step ? `${Math.round((stats.hit / step) * 100)}%` : "–",
                      "--fg",
                    ],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="bg-surface px-3 py-2">
                      <div
                        className="text-base font-semibold"
                        style={{ color: `rgb(var(${c}))` }}
                      >
                        {v}
                      </div>
                      <div className="text-[10.5px] text-muted">{k}</div>
                    </div>
                  ))}
                </div>

                <ul className="mt-4 h-[118px] space-y-1 overflow-hidden font-mono text-[11px]">
                  {executing ? (
                    log.map((s, i) =>
                      s.access ? (
                        <motion.li
                          key={`${s.access.page}-${snaps.indexOf(s)}`}
                          initial={i === 0 ? { opacity: 0, x: -8 } : false}
                          animate={{ opacity: 1 - i * 0.12, x: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-2"
                        >
                          <span
                            className="w-14 font-semibold uppercase"
                            style={{
                              color: `rgb(var(${RESULT_COLOR[s.result!]}))`,
                            }}
                          >
                            {s.result}
                          </span>
                          <span className="text-fg">{s.access.page}</span>
                          <span className="text-muted">→ frame {s.frame}</span>
                          {s.evicted && (
                            <span className="text-muted">
                              · evict {s.evicted}
                            </span>
                          )}
                        </motion.li>
                      ) : null,
                    )
                  ) : (
                    <li className="text-muted">
                      waiting for the executor to request pages…
                    </li>
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Full width: the two B+ tree indexes the plan reads */}
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease, delay: 0.75 }}
              className="min-w-0 border-t hairline p-4 sm:p-5 lg:col-span-2"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="eyebrow">Indexes · B+ trees</p>
                <span className="font-mono text-[11px] text-muted">
                  {executing && snap.access
                    ? snap.access.page.startsWith("ix:")
                      ? `reading ${snap.access.page} (orders index)`
                      : snap.access.page.startsWith("pk:") ||
                          snap.access.page.startsWith("c:")
                        ? `probing ${snap.access.page} (customers index)`
                        : `fetching heap page ${snap.access.page}`
                    : "both scans are index scans in the chosen plan"}
                </span>
              </div>
              <BPlusTreeViz
                trace={trace}
                step={step}
                frames={snap.frames}
                resultColor={
                  phase === "execute" && snap.result
                    ? `rgb(var(${RESULT_COLOR[snap.result]}))`
                    : undefined
                }
                executing={executing}
              />
            </motion.div>
          )}
        </div>
      </motion.div>
    </LayoutGroup>
  );
}
