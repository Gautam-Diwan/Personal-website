import { motion } from "framer-motion";
import type { Access } from "./arc";

/*
 * The two B+ tree indexes the IndexNLJoin plan reads, drawn from the same page trace
 * the buffer pool replays, so each highlighted node is the page the executor is
 * touching at that moment.
 *
 *  - orders(placed_at): descend root -> first leaf with key >= 09-01, then walk the
 *    leaf chain through sibling pointers; each leaf points at the heap pages it covers.
 *  - customers(id), clustered: one root -> leaf probe per joined order row. Skewed
 *    customer ids make a few leaves hot, which is what feeds ARC's T2.
 */

const SYS = (a = 1) => `rgb(var(--systems) / ${a})`;
const LINE = "rgb(var(--line) / 0.3)";

// orders(placed_at): leaf i starts at LEAF_KEYS[i]; the root's separators are leaves 1..6
const LEAF_KEYS = [
  "01-04",
  "03-12",
  "06-20",
  "09-01",
  "09-19",
  "10-07",
  "10-28",
];
const FIRST_IN_RANGE = 3;
const HEAP_OF: Record<number, [number, number]> = {
  3: [12, 13],
  4: [14, 15],
  5: [16, 17],
  6: [18, 19],
};
const CUSTOMER_LEAVES = 14;

// orders tree geometry (viewBox 420 x 182)
const LW = 54;
const LGAP = 7;
const leafX = (i: number) => i * (LW + LGAP);
const ROOT = { x: 35, y: 12, w: 350, h: 30 };
const KEY_W = ROOT.w / 6;
const LEAF_Y = 78;
const LEAF_H = 40;
const HEAP_Y = 134;
const HEAP_W = 25;

// customers tree geometry (viewBox 420 x 122)
const CW = 28;
const CGAP = 2;
const cX = (i: number) => 1 + i * (CW + CGAP);
const PK = { x: 145, y: 10, w: 130, h: 28 };
const C_Y = 74;
const C_H = 30;

type Props = {
  trace: Access[];
  /** number of accesses executed so far (0 = none) */
  step: number;
  /** pages resident in the buffer pool right now */
  frames: (string | null)[];
  /** colour of the current access result (hit / miss / ghost) */
  resultColor?: string;
  executing: boolean;
};

export function BPlusTreeViz({
  trace,
  step,
  frames,
  resultColor,
  executing,
}: Props) {
  const done = trace.slice(0, step);
  const visited = new Set(done.map((a) => a.page));
  const current = executing && step > 0 ? trace[step - 1].page : null;
  const inPool = (page: string) => executing && frames.includes(page);
  const custCount = new Map<number, number>();
  done.forEach((a) => {
    if (a.page.startsWith("c:")) {
      const n = Number(a.page.slice(2));
      custCount.set(n, (custCount.get(n) ?? 0) + 1);
    }
  });
  const descended = visited.has("ix:root") && executing;
  const curLeaf = current?.startsWith("ix:L") ? Number(current.slice(4)) : null;
  const curCust = current?.startsWith("c:") ? Number(current.slice(2)) : null;
  const curHeap = current?.startsWith("o:") ? Number(current.slice(2)) : null;

  const stroke = (page: string) =>
    current === page
      ? (resultColor ?? SYS())
      : visited.has(page) && executing
        ? SYS(0.55)
        : "rgb(var(--line) / 0.28)";
  const strokeW = (page: string) => (current === page ? 2 : 1);

  const poolDot = (page: string, x: number, y: number) =>
    inPool(page) ? (
      <circle cx={x} cy={y} r={2.6} fill="rgb(var(--web))" />
    ) : null;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:gap-6">
      {/* ---------- orders(placed_at) ---------- */}
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-muted">
          <span className="font-semibold text-fg">orders(placed_at)</span> ·
          descend once, then follow sibling pointers
        </p>
        <svg
          viewBox="0 0 420 182"
          className="mt-2 w-full"
          role="img"
          aria-label="B+ tree index on orders.placed_at: the scan descends from the root to the first leaf at or after September 1, then walks the leaf chain"
        >
          {/* child pointers */}
          {LEAF_KEYS.map((_, i) => {
            const x1 = ROOT.x + i * KEY_W;
            const x2 = leafX(i) + LW / 2;
            const onPath = i === FIRST_IN_RANGE && descended;
            return (
              <line
                key={i}
                x1={x1}
                y1={ROOT.y + ROOT.h}
                x2={x2}
                y2={LEAF_Y}
                stroke={onPath ? SYS(0.8) : LINE}
                strokeWidth={onPath ? 1.8 : 1}
                strokeDasharray={onPath ? undefined : "2 3"}
              />
            );
          })}
          {curLeaf === FIRST_IN_RANGE && (
            <motion.circle
              key={`descend${step}`}
              r={3.5}
              fill={SYS()}
              initial={{
                cx: ROOT.x + FIRST_IN_RANGE * KEY_W,
                cy: ROOT.y + ROOT.h,
              }}
              animate={{ cx: leafX(FIRST_IN_RANGE) + LW / 2, cy: LEAF_Y }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* root */}
          <rect
            x={ROOT.x}
            y={ROOT.y}
            width={ROOT.w}
            height={ROOT.h}
            rx={7}
            fill="rgb(var(--bg))"
            stroke={stroke("ix:root")}
            strokeWidth={strokeW("ix:root")}
            style={{ transition: "stroke 0.2s" }}
          />
          {LEAF_KEYS.slice(1).map((k, j) => {
            const x = ROOT.x + j * KEY_W;
            const chosen = descended && j + 1 === FIRST_IN_RANGE;
            return (
              <g key={k}>
                {j > 0 && (
                  <line
                    x1={x}
                    y1={ROOT.y + 6}
                    x2={x}
                    y2={ROOT.y + ROOT.h - 6}
                    stroke={LINE}
                  />
                )}
                <text
                  x={x + KEY_W / 2}
                  y={ROOT.y + ROOT.h / 2 + 3.5}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={12}
                  fontWeight={chosen ? 700 : 500}
                  fill={chosen ? SYS() : "rgb(var(--muted))"}
                >
                  {k}
                </text>
              </g>
            );
          })}
          <text
            x={ROOT.x - 4}
            y={ROOT.y + ROOT.h / 2 + 3.5}
            textAnchor="end"
            className="font-mono"
            fontSize={10}
            fill="rgb(var(--subtle))"
          >
            root
          </text>
          {poolDot("ix:root", ROOT.x + ROOT.w - 6, ROOT.y + 6)}

          {/* leaves + sibling pointers */}
          {LEAF_KEYS.map((k, i) => {
            const page = `ix:L${i}`;
            const x = leafX(i);
            const pruned = descended && i < FIRST_IN_RANGE;
            const walked =
              executing && visited.has(`ix:L${i + 1}`) && i >= FIRST_IN_RANGE;
            return (
              <g key={page} opacity={pruned ? 0.35 : 1}>
                {i < LEAF_KEYS.length - 1 && (
                  <line
                    x1={x + LW}
                    y1={LEAF_Y + LEAF_H / 2}
                    x2={x + LW + LGAP}
                    y2={LEAF_Y + LEAF_H / 2}
                    stroke={walked ? SYS(0.8) : LINE}
                    strokeWidth={walked ? 2 : 1}
                  />
                )}
                <rect
                  x={x}
                  y={LEAF_Y}
                  width={LW}
                  height={LEAF_H}
                  rx={6}
                  fill={
                    visited.has(page) && executing ? SYS(0.1) : "rgb(var(--bg))"
                  }
                  stroke={stroke(page)}
                  strokeWidth={strokeW(page)}
                  style={{ transition: "stroke 0.2s, fill 0.2s" }}
                />
                <text
                  x={x + 6}
                  y={LEAF_Y + 14}
                  className="font-mono"
                  fontSize={10}
                  fill="rgb(var(--subtle))"
                >
                  L{i}
                </text>
                <text
                  x={x + 6}
                  y={LEAF_Y + 31}
                  className="font-mono"
                  fontSize={13}
                  fontWeight={600}
                  fill="rgb(var(--fg))"
                >
                  {k}
                </text>
                {poolDot(page, x + LW - 6, LEAF_Y + 6)}
              </g>
            );
          })}
          {curLeaf !== null && curLeaf > FIRST_IN_RANGE && (
            <motion.circle
              key={`sib${step}`}
              r={3.5}
              cy={LEAF_Y + LEAF_H / 2}
              fill={SYS()}
              initial={{ cx: leafX(curLeaf - 1) + LW / 2 }}
              animate={{ cx: leafX(curLeaf) + LW / 2 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}

          {/* heap pages each in-range leaf points to */}
          {Object.entries(HEAP_OF).map(([leaf, pages]) =>
            pages.map((n, j) => {
              const page = `o:${n}`;
              const x = leafX(Number(leaf)) + j * (HEAP_W + 4);
              const cur = curHeap === n;
              return (
                <g key={page}>
                  <line
                    x1={x + HEAP_W / 2}
                    y1={LEAF_Y + LEAF_H}
                    x2={x + HEAP_W / 2}
                    y2={HEAP_Y}
                    stroke={cur ? (resultColor ?? SYS()) : LINE}
                    strokeDasharray={cur ? undefined : "2 2"}
                  />
                  <rect
                    x={x}
                    y={HEAP_Y}
                    width={HEAP_W}
                    height={20}
                    rx={4}
                    fill="rgb(var(--bg))"
                    stroke={stroke(page)}
                    strokeWidth={strokeW(page)}
                  />
                  <text
                    x={x + HEAP_W / 2}
                    y={HEAP_Y + 14.5}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={11}
                    fill={
                      visited.has(page) && executing
                        ? "rgb(var(--fg))"
                        : "rgb(var(--muted))"
                    }
                  >
                    {n}
                  </text>
                </g>
              );
            }),
          )}

          {/* range bracket */}
          <path
            d={`M${leafX(3)} 163 v5 H${leafX(6) + LW} v-5`}
            fill="none"
            stroke={SYS(0.6)}
          />
          <text
            x={(leafX(3) + leafX(6) + LW) / 2}
            y={178}
            textAnchor="middle"
            className="font-mono"
            fontSize={10.5}
            fill={SYS()}
          >
            ≥ 09-01 · heap pages o:12–19
          </text>
        </svg>
      </div>

      {/* ---------- customers(id) ---------- */}
      <div className="min-w-0">
        <p className="font-mono text-[11px] text-muted">
          <span className="font-semibold text-fg">customers(id)</span> ·
          clustered, one probe per order row
        </p>
        <svg
          viewBox="0 0 420 122"
          className="mt-2 w-full"
          role="img"
          aria-label="Clustered B+ tree on customers.id: each joined order probes from the root to one leaf; frequently probed leaves are shaded darker"
        >
          {Array.from({ length: CUSTOMER_LEAVES }, (_, i) => (
            <line
              key={i}
              x1={PK.x + PK.w / 2}
              y1={PK.y + PK.h}
              x2={cX(i) + CW / 2}
              y2={C_Y}
              stroke={curCust === i ? SYS(0.85) : LINE}
              strokeWidth={curCust === i ? 1.8 : 1}
              strokeDasharray={curCust === i ? undefined : "2 3"}
            />
          ))}
          {curCust !== null && (
            <motion.circle
              key={`probe${step}`}
              r={3.5}
              fill={SYS()}
              initial={{ cx: PK.x + PK.w / 2, cy: PK.y + PK.h }}
              animate={{ cx: cX(curCust) + CW / 2, cy: C_Y }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          )}
          <rect
            x={PK.x}
            y={PK.y}
            width={PK.w}
            height={PK.h}
            rx={7}
            fill="rgb(var(--bg))"
            stroke={stroke("pk:root")}
            strokeWidth={strokeW("pk:root")}
            style={{ transition: "stroke 0.2s" }}
          />
          <text
            x={PK.x + PK.w / 2}
            y={PK.y + PK.h / 2 + 3.5}
            textAnchor="middle"
            className="font-mono"
            fontSize={11.5}
            fontWeight={600}
            fill="rgb(var(--fg))"
          >
            pk:root
          </text>
          {poolDot("pk:root", PK.x + PK.w - 6, PK.y + 6)}

          {Array.from({ length: CUSTOMER_LEAVES }, (_, i) => {
            const page = `c:${i}`;
            const n = executing ? (custCount.get(i) ?? 0) : 0;
            return (
              <g key={page}>
                <rect
                  x={cX(i)}
                  y={C_Y}
                  width={CW}
                  height={C_H}
                  rx={5}
                  fill={
                    n ? SYS(Math.min(0.5, 0.1 + n * 0.08)) : "rgb(var(--bg))"
                  }
                  stroke={stroke(page)}
                  strokeWidth={strokeW(page)}
                  style={{ transition: "stroke 0.2s, fill 0.3s" }}
                />
                <text
                  x={cX(i) + CW / 2}
                  y={C_Y + C_H / 2 + 4}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize={12}
                  fontWeight={n ? 600 : 400}
                  fill={n ? "rgb(var(--fg))" : "rgb(var(--muted))"}
                >
                  {i}
                </text>
                {poolDot(page, cX(i) + CW - 5, C_Y + 5)}
                {n > 0 && (
                  <text
                    x={cX(i) + CW / 2}
                    y={C_Y + C_H + 13}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={10}
                    fill={SYS()}
                  >
                    ×{n}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-muted">
          <span>leaves c:0 … c:13 hold the rows</span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-[6px] w-[6px] rounded-full"
              style={{ background: "rgb(var(--web))" }}
            />
            in buffer pool
          </span>
        </p>
      </div>
    </div>
  );
}
