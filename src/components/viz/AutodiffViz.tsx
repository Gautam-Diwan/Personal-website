import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Play, RotateCcw, TrendingDown } from "lucide-react";

type NodeId = "x" | "w" | "b" | "y" | "mul" | "add" | "tanh" | "sub" | "L";

const ML = (a = 1) => `rgb(var(--ml) / ${a})`;
const LR = 0.5;
const INIT = { x: 1.5, w: -0.4, b: 0.1, y: 0.8 };

const NODES: { id: NodeId; name: string; op?: string; x: number; y: number; param?: boolean }[] = [
  { id: "x", name: "x", x: 70, y: 70 },
  { id: "w", name: "w", x: 70, y: 190, param: true },
  { id: "mul", name: "m", op: "×", x: 245, y: 130 },
  { id: "b", name: "b", x: 245, y: 265, param: true },
  { id: "add", name: "z", op: "+", x: 410, y: 175 },
  { id: "tanh", name: "a", op: "tanh", x: 570, y: 175 },
  { id: "y", name: "y", x: 570, y: 290 },
  { id: "sub", name: "d", op: "−", x: 725, y: 210 },
  { id: "L", name: "L", op: "( )²", x: 870, y: 210 },
];

/** [input, consumer, local derivative of consumer w.r.t. input] */
const EDGES: [NodeId, NodeId, string][] = [
  ["x", "mul", "∂m/∂x = w"],
  ["w", "mul", "∂m/∂w = x"],
  ["mul", "add", "1"],
  ["b", "add", "1"],
  ["add", "tanh", "1 − a²"],
  ["tanh", "sub", "1"],
  ["y", "sub", "−1"],
  ["sub", "L", "2d"],
];

const FWD: NodeId[] = ["mul", "add", "tanh", "sub", "L"];
const BWD: NodeId[] = ["L", "sub", "y", "tanh", "add", "b", "mul", "w", "x"];
const LEAVES: NodeId[] = ["x", "w", "b", "y"];
const W = 104;
const H = 54;

function compute({ x, w, b, y }: typeof INIT) {
  const mul = x * w;
  const add = mul + b;
  const tanh = Math.tanh(add);
  const sub = tanh - y;
  const L = sub * sub;
  const gL = 1;
  const gsub = 2 * sub * gL;
  const gtanh = gsub;
  const gy = -gsub;
  const gadd = gtanh * (1 - tanh * tanh);
  const gmul = gadd;
  const gb = gadd;
  const gw = gmul * x;
  const gx = gmul * w;
  return {
    value: { x, w, b, y, mul, add, tanh, sub, L } as Record<NodeId, number>,
    grad: { x: gx, w: gw, b: gb, y: gy, mul: gmul, add: gadd, tanh: gtanh, sub: gsub, L: gL } as Record<NodeId, number>,
  };
}

const fmt = (n: number) => (Math.abs(n) < 0.0005 ? "0.000" : n.toFixed(3));
const pos = (id: NodeId) => NODES.find((n) => n.id === id)!;

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  param,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  param?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 font-mono text-[11px]">
      <span className="w-4" style={{ color: param ? ML() : "rgb(var(--muted))" }}>
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-line/15"
        style={{ accentColor: "rgb(var(--ml))" }}
      />
      <span className="w-12 text-right text-fg">{value.toFixed(2)}</span>
    </label>
  );
}

export function AutodiffViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px", once: true });
  const reduced = useReducedMotion();
  const [params, setParams] = useState(INIT);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<number[]>(() => [compute(INIT).value.L]);
  const total = FWD.length + BWD.length;
  const { value, grad } = useMemo(() => compute(params), [params]);

  const run = () => {
    setTick(0);
    setRunning(true);
  };

  useEffect(() => {
    if (inView) {
      if (reduced) setTick(total);
      else run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  useEffect(() => {
    if (!running) return;
    if (tick >= total) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setTick((k) => k + 1), tick < FWD.length ? 520 : 420);
    return () => clearTimeout(t);
  }, [running, tick, total]);

  const set = (k: keyof typeof INIT) => (v: number) => {
    setRunning(false);
    setTick(total);
    setParams((p) => ({ ...p, [k]: v }));
    setHistory([compute({ ...params, [k]: v }).value.L]);
  };

  const gradientStep = () => {
    const next = { ...params, w: params.w - LR * grad.w, b: params.b - LR * grad.b };
    setParams(next);
    setHistory((h) => [...h.slice(-23), compute(next).value.L]);
    if (reduced) setTick(total);
    else run();
  };

  const reset = () => {
    setParams(INIT);
    setHistory([compute(INIT).value.L]);
    run();
  };

  const fwdDone = Math.min(tick, FWD.length);
  const bwdDone = Math.max(0, tick - FWD.length);
  const valueShown = (id: NodeId) => LEAVES.includes(id) || FWD.indexOf(id) < fwdDone;
  const gradShown = (id: NodeId) => BWD.indexOf(id) < bwdDone;
  const justForward = tick > 0 && tick <= FWD.length ? FWD[tick - 1] : null;
  const justBackward = bwdDone > 0 && tick <= total ? BWD[bwdDone - 1] : null;
  const phase = tick === 0 ? "ready" : tick <= FWD.length ? "forward" : tick < total ? "backward" : "done";

  // Sparkline
  const maxL = Math.max(...history, 0.01);
  const spark = history
    .map((l, i) => `${(i / Math.max(history.length - 1, 1)) * 140},${36 - (l / maxL) * 32}`)
    .join(" ");

  return (
    <div ref={ref} className="card overflow-hidden !bg-surface/85">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-5 py-3.5">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {(["forward", "backward"] as const).map((p) => {
            const on = phase === p;
            const reached = (p === "forward" && tick > 0) || (p === "backward" && bwdDone > 0);
            return (
              <span
                key={p}
                className="rounded-full border px-2.5 py-1 transition-colors"
                style={{
                  color: reached ? ML() : "rgb(var(--subtle))",
                  borderColor: on ? ML(0.45) : "rgb(var(--line) / var(--line-alpha))",
                  background: on ? ML(0.1) : "transparent",
                }}
              >
                {p === "forward" ? "→ forward pass" : "← backward pass"}
              </span>
            );
          })}
          <span className="ml-2 hidden text-subtle sm:inline">L = (tanh(x·w + b) − y)²</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={run}
            className="flex h-8 items-center gap-1.5 rounded-lg border hairline px-2.5 font-mono text-[11px] text-muted transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <Play size={12} /> Run
          </button>
          <button
            onClick={gradientStep}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 font-mono text-[11px] text-bg transition-opacity hover:opacity-90"
            style={{ background: ML() }}
          >
            <TrendingDown size={12} /> Gradient step
          </button>
          <button
            onClick={reset}
            className="grid h-8 w-8 place-items-center rounded-lg border hairline text-muted transition-colors hover:bg-fg/5 hover:text-fg"
            aria-label="Reset"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto px-3 pt-3">
        <svg viewBox="0 0 940 330" className="min-w-[640px]" role="img" aria-label="Computational graph with forward values and backward gradients">
          <defs>
            <marker id="ad-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="rgb(var(--line) / 0.3)" />
            </marker>
          </defs>
          {EDGES.map(([from, to, local]) => {
            const A = pos(from);
            const B = pos(to);
            const x1 = A.x + W / 2;
            const y1 = A.y;
            const x2 = B.x - W / 2;
            const y2 = B.y;
            const midX = (x1 + x2) / 2;
            const d = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
            const back = gradShown(from);
            return (
              <g key={from + to}>
                <path d={d} fill="none" stroke={back ? ML(0.55) : "rgb(var(--line) / 0.2)"} strokeWidth={back ? 1.6 : 1.2} markerEnd="url(#ad-arrow)" style={{ transition: "stroke 0.3s" }} />
                {justForward === to && (
                  <motion.circle
                    key={`f${tick}${from}`}
                    r={4}
                    fill="rgb(var(--fg))"
                    style={{ offsetPath: `path('${d}')` } as React.CSSProperties}
                    initial={{ offsetDistance: "0%", opacity: 1 }}
                    animate={{ offsetDistance: "100%", opacity: 0.3 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                )}
                {justBackward === from && (
                  <motion.circle
                    key={`b${tick}${from}`}
                    r={4.5}
                    fill={ML()}
                    style={{ offsetPath: `path('${d}')` } as React.CSSProperties}
                    initial={{ offsetDistance: "100%", opacity: 1 }}
                    animate={{ offsetDistance: "0%", opacity: 0.4 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                )}
                {back && (
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    // Both edges into × converge on one point: label them just left of it, above and below
                    x={to === "mul" ? x2 - 8 : midX}
                    y={to === "mul" ? y2 + (from === "x" ? -14 : 22) : (y1 + y2) / 2 - 8}
                    textAnchor={to === "mul" ? "end" : "middle"}
                    className="font-mono"
                    fontSize={10}
                    fill={ML(0.9)}
                    stroke="rgb(var(--surface))"
                    strokeWidth={4}
                    paintOrder="stroke"
                  >
                    {local}
                  </motion.text>
                )}
              </g>
            );
          })}

          {NODES.map((n) => {
            const isOp = !!n.op;
            const vs = valueShown(n.id);
            const gs = gradShown(n.id);
            const pulse = justForward === n.id || justBackward === n.id;
            return (
              <g key={n.id}>
                <rect
                  x={n.x - W / 2}
                  y={n.y - H / 2}
                  width={W}
                  height={H}
                  rx={12}
                  fill="rgb(var(--bg))"
                  stroke={pulse ? ML() : isOp ? ML(0.4) : n.param ? ML(0.6) : "rgb(var(--line) / 0.18)"}
                  strokeWidth={pulse ? 2 : 1}
                  strokeDasharray={n.param ? "0" : isOp ? "0" : "3 3"}
                  style={{ transition: "stroke 0.25s" }}
                />
                <text x={n.x - W / 2 + 10} y={n.y - 9} className="font-mono" fontSize={11} fill="rgb(var(--fg))">
                  {n.name}
                  {isOp && <tspan fill={ML()}>{`  ${n.op}`}</tspan>}
                  {n.param && <tspan fill={ML()} fontSize={9}>{"  param"}</tspan>}
                </text>
                <text x={n.x - W / 2 + 10} y={n.y + 7} className="font-mono" fontSize={10} fill="rgb(var(--muted))">
                  {vs ? `v ${fmt(value[n.id])}` : "v ·"}
                </text>
                <text x={n.x - W / 2 + 10} y={n.y + 20} className="font-mono" fontSize={10} fill={gs ? ML() : "rgb(var(--subtle))"}>
                  {gs ? `∂L ${fmt(grad[n.id])}` : "∂L ·"}
                </text>
                {pulse && (
                  <motion.rect
                    key={`p${tick}`}
                    x={n.x - W / 2}
                    y={n.y - H / 2}
                    width={W}
                    height={H}
                    rx={12}
                    fill={ML()}
                    initial={{ opacity: 0.25 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-6 border-t hairline p-5 md:grid-cols-[1fr_auto]">
        <div className="grid gap-x-10 gap-y-3 sm:grid-cols-3">
          <Slider label="x" value={params.x} min={-2} max={2} onChange={set("x")} />
          <Slider label="w" value={params.w} min={-2} max={2} onChange={set("w")} param />
          <Slider label="b" value={params.b} min={-2} max={2} onChange={set("b")} param />
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div>
            <div className="text-subtle">loss</div>
            <div className="text-base text-fg">{fmt(value.L)}</div>
          </div>
          <svg width={140} height={40} className="overflow-visible" aria-label="Loss history">
            <polyline points={spark} fill="none" stroke={ML()} strokeWidth={1.5} strokeLinejoin="round" />
            {history.length > 0 && (
              <circle
                cx={((history.length - 1) / Math.max(history.length - 1, 1)) * 140}
                cy={36 - (history[history.length - 1] / maxL) * 32}
                r={3}
                fill={ML()}
              />
            )}
          </svg>
          <div className="text-subtle">
            step {history.length - 1}
            <br />
            lr {LR}
          </div>
        </div>
      </div>
    </div>
  );
}
