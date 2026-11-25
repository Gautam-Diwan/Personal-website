import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { Power } from "lucide-react";

/*
 * Request lifecycle through a CQRS microservice stack (modeled on the Cloud Bookstore
 * project): a BFF routes commands and queries to separate services, writes publish Kafka
 * events, an ETL CronJob syncs the read model, and recommendations sit behind a circuit
 * breaker (3 failures → open, cool-down → half-open trial).
 */

type NodeId =
  "client" | "bff" | "cmd" | "qry" | "rec" | "rds" | "kafka" | "mongo";
const NODES: Record<
  NodeId,
  { x: number; y: number; label: string; sub: string }
> = {
  client: { x: 70, y: 175, label: "Client", sub: "React SPA" },
  bff: { x: 245, y: 175, label: "BFF", sub: "path router" },
  cmd: { x: 450, y: 60, label: "Command svc", sub: "FastAPI · writes" },
  qry: { x: 450, y: 175, label: "Query svc", sub: "FastAPI · reads" },
  rec: { x: 450, y: 290, label: "Recs svc", sub: "3s timeout" },
  rds: { x: 660, y: 60, label: "RDS", sub: "Postgres · source" },
  kafka: { x: 840, y: 60, label: "Kafka", sub: "CRM events" },
  mongo: { x: 660, y: 175, label: "MongoDB", sub: "read model" },
};
const NW = 132;
const NH = 50;

const EDGES: [NodeId, NodeId][] = [
  ["client", "bff"],
  ["bff", "cmd"],
  ["bff", "qry"],
  ["bff", "rec"],
  ["cmd", "rds"],
  ["rds", "kafka"],
  ["qry", "mongo"],
];

const center = (id: NodeId) => NODES[id];
function pathThrough(ids: NodeId[]) {
  return ids
    .map((id, i) => `${i ? "L" : "M"}${center(id).x},${center(id).y}`)
    .join(" ");
}
const ETL_PATH = `M${NODES.rds.x + 40},${NODES.rds.y + NH / 2} C${NODES.rds.x + 110},${NODES.rds.y + 70} ${NODES.mongo.x + 110},${NODES.mongo.y - 70} ${NODES.mongo.x + 40},${NODES.mongo.y - NH / 2}`;

type Kind = "query" | "command" | "recs";
type Breaker = "closed" | "open" | "half-open";
type Flight = {
  id: number;
  path: NodeId[];
  color: string;
  dur: number;
  hold?: boolean;
  outcome: "ok" | "fail" | "short";
};
type Entry = {
  id: number;
  method: string;
  url: string;
  status: number;
  note?: string;
  segs: { label: string; ms: number; color: string }[];
};

const WEB = "rgb(var(--web))";
const BAD = "rgb(var(--systems))";
const FAIL_THRESHOLD = 3;
const COOLDOWN_MS = 6000; // stands in for the 60s open window

const jitter = (base: number) =>
  Math.round(base * (0.8 + Math.random() * 0.45));

export function RequestFlowViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const reduced = useReducedMotion();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [log, setLog] = useState<Entry[]>([]);
  const [recsUp, setRecsUp] = useState(true);
  const [breaker, setBreaker] = useState<Breaker>("closed");
  const [failures, setFailures] = useState(0);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [etlPulse, setEtlPulse] = useState(0);
  const [auto, setAuto] = useState(true);
  const nextId = useRef(1);
  const stateRef = useRef({ recsUp, breaker, failures });
  stateRef.current = { recsUp, breaker, failures };

  const launch = useCallback((f: Omit<Flight, "id">) => {
    const id = nextId.current++;
    setFlights((fs) => [...fs, { ...f, id }]);
    window.setTimeout(
      () => setFlights((fs) => fs.filter((x) => x.id !== id)),
      f.dur * 1000 + 100,
    );
  }, []);

  const record = (e: Omit<Entry, "id">) =>
    setLog((l) => [{ ...e, id: nextId.current++ }, ...l].slice(0, 4));

  const send = useCallback(
    (kind: Kind) => {
      const { recsUp, breaker, failures } = stateRef.current;
      if (kind === "query") {
        const s = [
          { label: "bff", ms: jitter(4), color: "rgb(var(--web) / 0.45)" },
          { label: "query svc", ms: jitter(9), color: "rgb(var(--web) / 0.7)" },
          { label: "mongo", ms: jitter(14), color: WEB },
        ];
        launch({
          path: ["client", "bff", "qry", "mongo"],
          color: WEB,
          dur: 1.2,
          outcome: "ok",
        });
        record({ method: "GET", url: "/books?q=dune", status: 200, segs: s });
      } else if (kind === "command") {
        const s = [
          { label: "bff", ms: jitter(4), color: "rgb(var(--web) / 0.45)" },
          {
            label: "command svc",
            ms: jitter(12),
            color: "rgb(var(--web) / 0.7)",
          },
          { label: "rds txn", ms: jitter(22), color: WEB },
        ];
        launch({
          path: ["client", "bff", "cmd", "rds"],
          color: WEB,
          dur: 1.3,
          outcome: "ok",
        });
        window.setTimeout(
          () =>
            launch({
              path: ["rds", "kafka"],
              color: "rgb(var(--ml))",
              dur: 0.9,
              outcome: "ok",
            }),
          650,
        );
        record({
          method: "POST",
          url: "/books",
          status: 201,
          note: "event → Kafka",
          segs: s,
        });
      } else {
        if (breaker === "open") {
          launch({
            path: ["client", "bff"],
            color: BAD,
            dur: 0.6,
            outcome: "short",
          });
          record({
            method: "GET",
            url: "/recs/0441013597",
            status: 200,
            note: "breaker open → cached fallback",
            segs: [
              {
                label: "bff fallback",
                ms: jitter(3),
                color: "rgb(var(--systems) / 0.7)",
              },
            ],
          });
          return;
        }
        if (recsUp) {
          launch({
            path: ["client", "bff", "rec"],
            color: WEB,
            dur: 1.1,
            outcome: "ok",
          });
          record({
            method: "GET",
            url: "/recs/0441013597",
            status: 200,
            note:
              breaker === "half-open" ? "trial ok → breaker closed" : undefined,
            segs: [
              { label: "bff", ms: jitter(4), color: "rgb(var(--web) / 0.45)" },
              { label: "recs svc", ms: jitter(38), color: WEB },
            ],
          });
          setFailures(0);
          setBreaker("closed");
          setOpenedAt(null);
        } else {
          launch({
            path: ["client", "bff", "rec"],
            color: BAD,
            dur: 2.1,
            hold: true,
            outcome: "fail",
          });
          const nextFailures = failures + 1;
          const trips =
            breaker === "half-open" || nextFailures >= FAIL_THRESHOLD;
          record({
            method: "GET",
            url: "/recs/0441013597",
            status: 504,
            note: trips
              ? "timeout → breaker opens"
              : `timeout (${nextFailures}/${FAIL_THRESHOLD})`,
            segs: [
              { label: "bff", ms: jitter(4), color: "rgb(var(--web) / 0.45)" },
              { label: "timeout", ms: 3000, color: BAD },
            ],
          });
          window.setTimeout(() => {
            setFailures(trips ? 0 : nextFailures);
            if (trips) {
              setBreaker("open");
              setOpenedAt(Date.now());
            }
          }, 1100);
        }
      }
    },
    [launch],
  );

  // Breaker cool-down → half-open
  useEffect(() => {
    if (breaker !== "open" || openedAt === null) return;
    const tick = window.setInterval(() => setNow(Date.now()), 100);
    const t = window.setTimeout(
      () => setBreaker("half-open"),
      COOLDOWN_MS - (Date.now() - openedAt),
    );
    return () => {
      clearInterval(tick);
      clearTimeout(t);
    };
  }, [breaker, openedAt]);

  // ETL CronJob pulse
  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setInterval(() => setEtlPulse((p) => p + 1), 5200);
    return () => clearInterval(t);
  }, [inView, reduced]);

  // Scripted demo until the visitor takes over
  useEffect(() => {
    if (!inView || !auto || reduced) return;
    const script: (() => void)[] = [
      () => send("query"),
      () => send("command"),
      () => send("recs"),
      () => send("query"),
      () => setRecsUp(false),
      () => send("recs"),
      () => send("recs"),
      () => send("recs"),
      () => send("recs"),
      () => send("query"),
      () => {}, // let the breaker cool down
      () => {},
      () => send("recs"), // half-open trial fails again
      () => {},
      () => {},
      () => setRecsUp(true),
      () => {},
      () => send("recs"), // trial succeeds → closed
      () => send("command"),
    ];
    let i = 0;
    const t = window.setInterval(() => {
      script[i % script.length]();
      i++;
    }, 1500);
    return () => clearInterval(t);
  }, [inView, auto, reduced, send]);

  const manual = (fn: () => void) => () => {
    setAuto(false);
    fn();
  };

  const activeNodes = new Set(flights.flatMap((f) => f.path));
  const breakerColor =
    breaker === "closed"
      ? WEB
      : breaker === "open"
        ? "rgb(var(--systems))"
        : "rgb(var(--ml))";
  const cooldown =
    breaker === "open" && openedAt
      ? Math.min(1, (now - openedAt) / COOLDOWN_MS)
      : 0;
  const maxMs = 60;

  return (
    <div ref={ref} className="card overflow-hidden !bg-surface/95">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline px-5 py-3.5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["GET /books?q=", "query"],
              ["POST /books", "command"],
              ["GET /recs/:isbn", "recs"],
            ] as const
          ).map(([label, kind]) => (
            <button
              key={kind}
              onClick={manual(() => send(kind))}
              className="rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors hover:bg-web/10"
              style={{ color: WEB, borderColor: "rgb(var(--web) / 0.5)" }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={manual(() => setRecsUp((u) => !u))}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold transition-colors"
          style={{
            color: recsUp ? "rgb(var(--fg))" : "rgb(var(--systems))",
            borderColor: recsUp
              ? "rgb(var(--line) / 0.3)"
              : "rgb(var(--systems) / 0.6)",
            background: recsUp ? "transparent" : "rgb(var(--systems) / 0.12)",
          }}
          aria-pressed={!recsUp}
        >
          <Power size={13} /> Recs svc: {recsUp ? "up" : "down"}
        </button>
      </div>

      {/* Diagram spans the full width; waterfall and breaker sit beneath it */}
      <div>
        <div className="overflow-x-auto border-b hairline px-4 py-5">
          <svg
            viewBox="0 0 920 350"
            className="mx-auto w-full min-w-[620px] max-w-[1040px]"
            role="img"
            aria-label="Request flow through BFF, CQRS services, databases, and a circuit breaker"
          >
            {EDGES.map(([a, b]) => (
              <line
                key={a + b}
                x1={center(a).x}
                y1={center(a).y}
                x2={center(b).x}
                y2={center(b).y}
                stroke={
                  activeNodes.has(a) && activeNodes.has(b)
                    ? "rgb(var(--web) / 0.7)"
                    : "rgb(var(--line) / 0.3)"
                }
                strokeWidth={1.6}
                style={{ transition: "stroke 0.3s" }}
              />
            ))}
            {/* ETL CronJob: RDS → Mongo */}
            <path
              d={ETL_PATH}
              fill="none"
              stroke="rgb(var(--line) / 0.35)"
              strokeWidth={1.4}
              strokeDasharray="5 5"
            />
            <text
              x={NODES.rds.x + 118}
              y={(NODES.rds.y + NODES.mongo.y) / 2 + 4}
              className="font-mono"
              fontSize={11}
              fill="rgb(var(--muted))"
            >
              ETL CronJob · 60s
            </text>
            {etlPulse > 0 &&
              [0, 0.25, 0.5].map((d) => (
                <motion.circle
                  key={`${etlPulse}-${d}`}
                  r={3.5}
                  fill="rgb(var(--ml))"
                  style={
                    { offsetPath: `path('${ETL_PATH}')` } as React.CSSProperties
                  }
                  initial={{ offsetDistance: "0%", opacity: 1 }}
                  animate={{ offsetDistance: "100%", opacity: 0.2 }}
                  transition={{ duration: 1.4, delay: d, ease: "easeInOut" }}
                />
              ))}

            {/* Circuit breaker on the BFF → recs edge */}
            <g
              transform={`translate(${(NODES.bff.x + NODES.rec.x) / 2 + 10} ${(NODES.bff.y + NODES.rec.y) / 2 + 6})`}
            >
              <rect
                x={-44}
                y={-14}
                width={88}
                height={28}
                rx={14}
                fill="rgb(var(--bg))"
                stroke={breakerColor}
                strokeWidth={1.8}
              />
              <text
                textAnchor="middle"
                y={4.5}
                className="font-mono"
                fontSize={11}
                fontWeight={700}
                fill={breakerColor}
              >
                {breaker.toUpperCase()}
              </text>
            </g>

            {(Object.keys(NODES) as NodeId[]).map((id) => {
              const n = NODES[id];
              const active = activeNodes.has(id);
              const down = id === "rec" && !recsUp;
              return (
                <g key={id}>
                  <rect
                    x={n.x - NW / 2}
                    y={n.y - NH / 2}
                    width={NW}
                    height={NH}
                    rx={11}
                    fill="rgb(var(--surface))"
                    stroke={
                      down
                        ? "rgb(var(--systems))"
                        : active
                          ? WEB
                          : "rgb(var(--line) / 0.35)"
                    }
                    strokeWidth={active || down ? 2 : 1.2}
                    strokeDasharray={down ? "5 4" : undefined}
                    style={{ transition: "stroke 0.25s" }}
                  />
                  <text
                    x={n.x}
                    y={n.y - 3}
                    textAnchor="middle"
                    fontSize={13.5}
                    fontWeight={600}
                    fill="rgb(var(--fg))"
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x}
                    y={n.y + 14}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={10.5}
                    fill={down ? "rgb(var(--systems))" : "rgb(var(--muted))"}
                  >
                    {down ? "unavailable" : n.sub}
                  </text>
                </g>
              );
            })}

            {flights.map((f) => {
              const d = pathThrough(f.path);
              const back =
                f.outcome !== "fail"
                  ? ["0%", "100%", "0%"]
                  : ["0%", "100%", "100%", "0%"];
              return (
                <motion.circle
                  key={f.id}
                  r={6}
                  fill={f.color}
                  stroke="rgb(var(--bg))"
                  strokeWidth={2}
                  style={{ offsetPath: `path('${d}')` } as React.CSSProperties}
                  initial={{ offsetDistance: "0%" }}
                  animate={{ offsetDistance: back }}
                  transition={{
                    duration: f.dur,
                    ease: "easeInOut",
                    times: back.length === 4 ? [0, 0.35, 0.75, 1] : [0, 0.5, 1],
                  }}
                />
              );
            })}
          </svg>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Network · waterfall</p>
            <span className="font-mono text-xs text-muted">
              {auto ? "auto demo · click to take over" : "manual"}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            <AnimatePresence initial={false}>
              {log.map((e) => {
                const total = e.segs.reduce((s, x) => s + x.ms, 0);
                const ok = e.status < 400;
                return (
                  <motion.li
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border hairline bg-bg/70 px-3 py-2 font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-10 font-semibold text-fg">
                        {e.method}
                      </span>
                      <span className="flex-1 truncate text-fg">{e.url}</span>
                      <span
                        className="rounded px-1.5 py-0.5 font-semibold"
                        style={{
                          color: ok ? WEB : "rgb(var(--systems))",
                          background: ok
                            ? "rgb(var(--web) / 0.12)"
                            : "rgb(var(--systems) / 0.14)",
                        }}
                      >
                        {e.status}
                      </span>
                      <span className="w-14 text-right text-fg">
                        {total >= 1000
                          ? `${(total / 1000).toFixed(1)}s`
                          : `${total}ms`}
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-fg/10">
                      {e.segs.map((s, i) => (
                        <motion.span
                          key={i}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(s.ms / Math.max(total, maxMs)) * 100}%`,
                          }}
                          transition={{ duration: 0.5, delay: i * 0.12 }}
                          style={{ background: s.color }}
                          title={`${s.label}: ${s.ms}ms`}
                        />
                      ))}
                    </div>
                    {e.note && (
                      <div className="mt-1 text-[11px] text-muted">
                        {e.note}
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {log.length === 0 && (
              <li className="font-mono text-xs text-muted">
                Send a request to see it traced…
              </li>
            )}
          </ul>

          <div className="mt-4 rounded-lg border hairline p-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted">circuit breaker</span>
              <span className="font-semibold" style={{ color: breakerColor }}>
                {breaker}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-muted">failures</span>
              {Array.from({ length: FAIL_THRESHOLD }, (_, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border"
                  style={{
                    borderColor: "rgb(var(--systems))",
                    background:
                      i < failures ? "rgb(var(--systems))" : "transparent",
                  }}
                />
              ))}
              <span className="ml-auto text-muted">
                trips at {FAIL_THRESHOLD}
              </span>
            </div>
            {breaker === "open" && (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cooldown * 100}%`,
                      background: "rgb(var(--systems))",
                    }}
                  />
                </div>
                <div className="mt-1 text-[11px] text-muted">
                  cooling down, then one half-open trial request
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
