import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { RotateCcw } from "lucide-react";
import {
  EPOCHS,
  ITEMS,
  K,
  USERS,
  clampRating,
  predict,
  stateAt,
  trainMF,
  type Snapshot,
} from "./mf";

/* Manim / 3Blue1Brown palette on a black frame (kept black in both site themes, like a video) */
const M = {
  bg: "#000000",
  text: "#F5F5F5",
  dim: "#A6A6A6", // ~8.6:1 on black
  blue: "#58C4DD",
  yellow: "#F7D96F",
  green: "#83C167",
  red: "#FC6255",
  teal: "#5CD0B3",
  axis: "#BBBBBB",
};

/* Timeline in seconds */
const T_R = 0.2;
const T_FACTORS = 2.8;
const T_3D = 5.2;
const T_TRAIN = 7.4;
const TRAIN_DUR = 11;
const T_PRED = T_TRAIN + TRAIN_DUR + 0.6;
const T_END = T_PRED + 3.5;

const CAPTIONS: [number, string][] = [
  [0, "A ratings matrix R: users × movies, mostly unobserved."],
  [T_FACTORS, "Factor it into two thin matrices: R ≈ U Vᵀ."],
  [T_3D, "Each user (row of U) and item (column of Vᵀ) is a vector in ℝ³."],
  [T_TRAIN, "SGD on observed ratings: nudge u and v so u·v matches r."],
  [T_PRED, "The ?s are now predictions: just dot products."],
];

const epochAt = (t: number) => {
  const p = Math.min(1, Math.max(0, (t - T_TRAIN) / TRAIN_DUR));
  return (EPOCHS - 1) * Math.pow(p, 1.8); // linger on the fast early epochs
};
const ramp = (t: number, start: number, dur: number) =>
  Math.min(1, Math.max(0, (t - start) / dur));

/* ---------- 2D: bracketed matrices in the multiplication layout ---------- */

const CW = 44; // R / Vᵀ cell width
const RH = 34; // R / U row height
const VH = 30; // Vᵀ row height
const UW = 46; // U cell width
const U_X = 18;
const R_X = U_X + UW * K + 34;
const V_Y = 18;
const R_Y = V_Y + VH * K + 30;

function Brackets({
  x,
  y,
  w,
  h,
  color,
  progress,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  progress: number;
}) {
  const t = 7;
  return (
    <g stroke={color} strokeWidth={1.6} fill="none" opacity={progress}>
      <path d={`M${x + t},${y} L${x},${y} L${x},${y + h} L${x + t},${y + h}`} />
      <path
        d={`M${x + w - t},${y} L${x + w},${y} L${x + w},${y + h} L${x + w - t},${y + h}`}
      />
    </g>
  );
}

function Matrices({
  t,
  state,
  data,
  focus,
}: {
  t: number;
  state: Snapshot;
  data: ReturnType<typeof trainMF>;
  focus: [number, number] | null;
}) {
  const rIn = ramp(t, T_R, 1.8);
  const fIn = ramp(t, T_FACTORS, 1.2);
  const predIn = ramp(t, T_PRED, 0.8);
  const training = t >= T_TRAIN;

  return (
    <svg
      viewBox={`0 0 ${R_X + CW * ITEMS + 16} ${R_Y + RH * USERS + 22}`}
      className="w-full"
      role="img"
      aria-label="Ratings matrix R approximated by U times V transpose"
    >
      {/* Title in the empty top-left quadrant */}
      <text
        x={U_X + 4}
        y={V_Y + 40}
        fill={M.text}
        fontSize={30}
        fontStyle="italic"
        className="font-serif"
        opacity={rIn}
      >
        R ≈ UV
        <tspan fontSize={18} dy={-12}>
          ᵀ
        </tspan>
      </text>
      <text
        x={U_X + 4}
        y={V_Y + 66}
        fill={M.dim}
        fontSize={14}
        className="font-serif"
        opacity={fIn}
      >
        {USERS}×{ITEMS} ≈ ({USERS}×{K})({K}×{ITEMS})
      </text>

      {/* Vᵀ (items) above R's columns */}
      <g opacity={fIn} transform={`translate(0 ${(1 - fIn) * 30})`}>
        <Brackets
          x={R_X - 6}
          y={V_Y - 4}
          w={CW * ITEMS + 12}
          h={VH * K + 8}
          color={M.yellow}
          progress={1}
        />
        {state.V.map((v, i) =>
          v.map((x, f) => (
            <text
              key={`v${i}${f}`}
              x={R_X + i * CW + CW / 2}
              y={V_Y + f * VH + VH / 2 + 5}
              textAnchor="middle"
              fontSize={14.5}
              fill={M.yellow}
              className="font-serif"
            >
              {x.toFixed(2)}
            </text>
          )),
        )}
        <text
          x={R_X - 16}
          y={V_Y + (VH * K) / 2 + 6}
          textAnchor="end"
          fontSize={20}
          fontStyle="italic"
          fill={M.yellow}
          className="font-serif"
        >
          Vᵀ
        </text>
      </g>

      {/* U (users) beside R's rows */}
      <g opacity={fIn} transform={`translate(${(1 - fIn) * 30} 0)`}>
        <Brackets
          x={U_X - 6}
          y={R_Y - 4}
          w={UW * K + 12}
          h={RH * USERS + 8}
          color={M.blue}
          progress={1}
        />
        {state.U.map((u, r) =>
          u.map((x, f) => (
            <text
              key={`u${r}${f}`}
              x={U_X + f * UW + UW / 2}
              y={R_Y + r * RH + RH / 2 + 5}
              textAnchor="middle"
              fontSize={14.5}
              fill={M.blue}
              className="font-serif"
            >
              {x.toFixed(2)}
            </text>
          )),
        )}
        <text
          x={U_X + (UW * K) / 2}
          y={R_Y + RH * USERS + 20}
          textAnchor="middle"
          fontSize={20}
          fontStyle="italic"
          fill={M.blue}
          className="font-serif"
        >
          U
        </text>
      </g>

      {/* R */}
      <Brackets
        x={R_X - 6}
        y={R_Y - 4}
        w={CW * ITEMS + 12}
        h={RH * USERS + 8}
        color={M.text}
        progress={rIn}
      />
      {data.ratings.map((row, u) =>
        row.map((r, i) => {
          const appear = ramp(t, T_R + (u * ITEMS + i) * 0.03, 0.4);
          const cx = R_X + i * CW + CW / 2;
          const cy = R_Y + u * RH + RH / 2;
          const p = clampRating(predict(data.mu, state.U[u], state.V[i]));
          const err = r === null ? 0 : Math.abs(r - p);
          return (
            <g key={`r${u}${i}`} opacity={appear}>
              {r !== null && training && (
                <rect
                  x={cx - CW / 2 + 3}
                  y={cy - RH / 2 + 3}
                  width={CW - 6}
                  height={RH - 6}
                  rx={4}
                  fill={M.red}
                  opacity={Math.min(1, err / 2) * 0.55}
                />
              )}
              {r !== null ? (
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize={19}
                  fill={M.text}
                  className="font-serif"
                >
                  {r}
                </text>
              ) : predIn > 0 ? (
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize={17.5}
                  fill={M.green}
                  className="font-serif"
                  opacity={predIn}
                  transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * predIn}) translate(${-cx} ${-cy})`}
                >
                  {p.toFixed(1)}
                </text>
              ) : (
                <text
                  x={cx}
                  y={cy + 6}
                  textAnchor="middle"
                  fontSize={19}
                  fill={M.dim}
                  className="font-serif"
                >
                  ?
                </text>
              )}
            </g>
          );
        }),
      )}

      {/* SGD focus: one observed rating, its user row, its item column */}
      {focus && (
        <g fill="none" strokeWidth={2}>
          <rect
            x={U_X - 2}
            y={R_Y + focus[0] * RH + 2}
            width={UW * K + 4}
            height={RH - 4}
            rx={5}
            stroke={M.blue}
          />
          <rect
            x={R_X + focus[1] * CW + 2}
            y={V_Y - 2}
            width={CW - 4}
            height={VH * K + 4}
            rx={5}
            stroke={M.yellow}
          />
          <rect
            x={R_X + focus[1] * CW + 2}
            y={R_Y + focus[0] * RH + 2}
            width={CW - 4}
            height={RH - 4}
            rx={5}
            stroke={M.teal}
          />
        </g>
      )}
    </svg>
  );
}

/* ---------- 3D: vectors in ℝ³ with an orbiting camera ---------- */

type SceneState = {
  U: number[][];
  V: number[][];
  appear: number;
  focusUser: number | null;
  rated: (number | null)[][];
};

const AXIS_LEN = 1.7;
const up = new THREE.Vector3(0, 1, 0);

function Axes() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    for (const d of [0, 1, 2]) {
      const a = [0, 0, 0];
      const b = [0, 0, 0];
      a[d] = -AXIS_LEN;
      b[d] = AXIS_LEN;
      pts.push(...a, ...b);
      // ticks at -1 and 1
      for (const tick of [-1, 1]) {
        const c = [0, 0, 0];
        const e = [0, 0, 0];
        c[d] = tick;
        e[d] = tick;
        const o = d === 1 ? 0 : 1;
        c[o] = -0.05;
        e[o] = 0.05;
        pts.push(...c, ...e);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <group>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={M.axis} transparent opacity={0.55} />
      </lineSegments>
      {[
        [AXIS_LEN, 0, 0, 0, 0, -Math.PI / 2],
        [0, AXIS_LEN, 0, 0, 0, 0],
        [0, 0, AXIS_LEN, Math.PI / 2, 0, 0],
      ].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
          <coneGeometry args={[0.035, 0.1, 12]} />
          <meshBasicMaterial color={M.axis} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Arrow({
  index,
  stateRef,
}: {
  index: number;
  stateRef: React.MutableRefObject<SceneState>;
}) {
  const shaft = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  useFrame(() => {
    const s = stateRef.current;
    const [x, y, z] = s.U[index];
    v.set(x, y, z).multiplyScalar(s.appear);
    const len = Math.max(v.length(), 1e-4);
    q.setFromUnitVectors(up, v.clone().normalize());
    const focused = s.focusUser === index;
    const headLen = Math.min(0.12, len * 0.5);
    if (shaft.current) {
      shaft.current.quaternion.copy(q);
      shaft.current.scale.set(
        focused ? 1.8 : 1,
        Math.max(len - headLen, 1e-4),
        focused ? 1.8 : 1,
      );
      shaft.current.position.copy(v).multiplyScalar((len - headLen) / 2 / len);
      (shaft.current.material as THREE.MeshBasicMaterial).opacity =
        s.focusUser === null || focused ? 1 : 0.45;
    }
    if (head.current) {
      head.current.quaternion.copy(q);
      head.current.position.copy(v).multiplyScalar((len - headLen / 2) / len);
      head.current.scale.setScalar(focused ? 1.4 : 1);
      (head.current.material as THREE.MeshBasicMaterial).opacity =
        s.focusUser === null || focused ? 1 : 0.45;
    }
  });
  return (
    <group>
      <mesh ref={shaft}>
        <cylinderGeometry args={[0.011, 0.011, 1, 8]} />
        <meshBasicMaterial color={M.blue} transparent />
      </mesh>
      <mesh ref={head}>
        <coneGeometry args={[0.04, 0.12, 14]} />
        <meshBasicMaterial color={M.blue} transparent />
      </mesh>
    </group>
  );
}

function ItemDot({
  index,
  stateRef,
}: {
  index: number;
  stateRef: React.MutableRefObject<SceneState>;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const s = stateRef.current;
    const [x, y, z] = s.V[index];
    ref.current?.position.set(x * s.appear, y * s.appear, z * s.appear);
    ref.current?.scale.setScalar(Math.max(s.appear, 0.001));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={M.yellow} />
    </mesh>
  );
}

/** Dashed lines from the focused user to each item they rated, green for high ratings, red for low. */
function FocusLinks({
  stateRef,
}: {
  stateRef: React.MutableRefObject<SceneState>;
}) {
  const lines = useMemo(
    () =>
      Array.from({ length: ITEMS }, () => {
        const g = new THREE.BufferGeometry();
        g.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(new Array(6).fill(0), 3),
        );
        const m = new THREE.LineDashedMaterial({
          dashSize: 0.06,
          gapSize: 0.04,
          transparent: true,
        });
        return new THREE.Line(g, m);
      }),
    [],
  );
  useFrame(() => {
    const s = stateRef.current;
    lines.forEach((line, i) => {
      const r = s.focusUser === null ? null : s.rated[s.focusUser][i];
      line.visible = r !== null;
      if (r === null || s.focusUser === null) return;
      const pos = line.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      pos.setXYZ(0, ...(s.U[s.focusUser] as [number, number, number]));
      pos.setXYZ(1, ...(s.V[i] as [number, number, number]));
      pos.needsUpdate = true;
      line.computeLineDistances();
      const mat = line.material as THREE.LineDashedMaterial;
      mat.color.set(r >= 4 ? M.green : r <= 2 ? M.red : M.dim);
      mat.opacity = 0.85;
    });
  });
  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}

/** Projects 3D positions onto the overlay so labels stay crisp HTML text. */
function LabelProjector({
  stateRef,
  labels,
}: {
  stateRef: React.MutableRefObject<SceneState>;
  labels: React.MutableRefObject<(HTMLSpanElement | null)[]>;
}) {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = stateRef.current;
    const pts = [...s.U, ...s.V];
    pts.forEach(([x, y, z], i) => {
      const el = labels.current[i];
      if (!el) return;
      v.set(x * s.appear, y * s.appear, z * s.appear);
      // group rotation is applied to the scene parent; mirror it here
      if (group.current?.parent)
        v.applyMatrix4(group.current.parent.matrixWorld);
      v.project(camera);
      const px = (v.x * 0.5 + 0.5) * size.width;
      const py = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${px + 7}px, ${py - 18}px)`;
      el.style.opacity = String(s.appear);
    });
  });
  return <group ref={group} />;
}

function Scene({
  stateRef,
  labels,
  reduced,
}: {
  stateRef: React.MutableRefObject<SceneState>;
  labels: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  reduced: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  useFrame((_, dt) => {
    if (root.current && !reduced)
      root.current.rotation.y += Math.min(dt, 0.05) * 0.18;
  });
  return (
    <group ref={root}>
      <Axes />
      {Array.from({ length: USERS }, (_, i) => (
        <Arrow key={i} index={i} stateRef={stateRef} />
      ))}
      {Array.from({ length: ITEMS }, (_, i) => (
        <ItemDot key={i} index={i} stateRef={stateRef} />
      ))}
      <FocusLinks stateRef={stateRef} />
      <LabelProjector stateRef={stateRef} labels={labels} />
    </group>
  );
}

/* ---------- Loss curve ---------- */

function LossCurve({
  data,
  epoch,
}: {
  data: ReturnType<typeof trainMF>;
  epoch: number;
}) {
  const W = 300;
  const H = 120;
  const pad = { l: 34, r: 10, t: 12, b: 24 };
  const maxY = Math.ceil(data.snaps[0].rmse * 2) / 2;
  const x = (e: number) => pad.l + (e / (EPOCHS - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / maxY) * (H - pad.t - pad.b);
  const upto = Math.floor(epoch);
  const pts = data.snaps
    .slice(0, upto + 1)
    .map((s, e) => `${x(e)},${y(s.rmse)}`);
  const cur = stateAt(data.snaps, epoch).rmse;
  if (epoch > 0) pts.push(`${x(epoch)},${y(cur)}`);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full max-w-[320px]"
      role="img"
      aria-label={`Training RMSE ${cur.toFixed(2)}`}
    >
      <g stroke={M.axis} strokeWidth={1}>
        <line x1={pad.l} y1={H - pad.b} x2={W - pad.r} y2={H - pad.b} />
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={H - pad.b} />
        {[0, 0.5, 1, 1.5]
          .filter((v) => v <= maxY)
          .map((v) => (
            <line key={v} x1={pad.l - 4} y1={y(v)} x2={pad.l} y2={y(v)} />
          ))}
      </g>
      {[0, 0.5, 1, 1.5]
        .filter((v) => v <= maxY)
        .map((v) => (
          <text
            key={v}
            x={pad.l - 8}
            y={y(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill={M.dim}
            className="font-serif"
          >
            {v}
          </text>
        ))}
      <text
        x={W - pad.r}
        y={H - 6}
        textAnchor="end"
        fontSize={12}
        fill={M.dim}
        fontStyle="italic"
        className="font-serif"
      >
        epoch
      </text>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={M.teal}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {epoch > 0 && <circle cx={x(epoch)} cy={y(cur)} r={4} fill={M.teal} />}
      <text
        x={W - pad.r}
        textAnchor="end"
        y={pad.t + 12}
        fontSize={14}
        fill={M.text}
        className="font-serif"
      >
        <tspan fontStyle="italic">RMSE</tspan> = {cur.toFixed(3)}
      </text>
    </svg>
  );
}

/* ---------- Composition ---------- */

export function MatrixFactorizationViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-120px" });
  const reduced = !!useReducedMotion();
  const data = useMemo(() => trainMF(), []);
  const observed = useMemo(() => {
    const o: [number, number][] = [];
    data.ratings.forEach((row, u) =>
      row.forEach((r, i) => r !== null && o.push([u, i])),
    );
    return o;
  }, [data]);

  const [t, setT] = useState(0);
  const [manualEpoch, setManualEpoch] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);

  // Drive the timeline with rAF while visible
  useEffect(() => {
    if (reduced) {
      setT(T_END);
      return;
    }
    if (!inView || manualEpoch !== null) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((x) => Math.min(T_END, x + dt));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, manualEpoch, reduced, run]);

  const time = manualEpoch !== null ? T_END : t;
  const epoch = manualEpoch ?? epochAt(t);
  const state = useMemo(() => stateAt(data.snaps, epoch), [data, epoch]);
  const trainingNow =
    manualEpoch === null && t >= T_TRAIN && t < T_TRAIN + TRAIN_DUR;
  const focus = trainingNow
    ? observed[Math.floor(t * 5) % observed.length]
    : null;
  const appear = ramp(time, T_3D, 1.4);

  const stateRef = useRef<SceneState>({
    U: state.U,
    V: state.V,
    appear,
    focusUser: null,
    rated: data.ratings,
  });
  stateRef.current = {
    U: state.U,
    V: state.V,
    appear,
    focusUser: focus ? focus[0] : null,
    rated: data.ratings,
  };

  const caption = [...CAPTIONS].reverse().find(([start]) => time >= start)![1];
  const held = useMemo(() => {
    let total = 0;
    let exact = 0;
    data.ratings.forEach((row, u) =>
      row.forEach((r, i) => {
        if (r !== null) return;
        total++;
        if (
          Math.round(clampRating(predict(data.mu, state.U[u], state.V[i]))) ===
          data.truth[u][i]
        )
          exact++;
      }),
    );
    return { total, exact };
  }, [data, state]);

  const replay = () => {
    setManualEpoch(null);
    setT(0);
    setRun((r) => r + 1);
  };

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
      style={{ background: M.bg, color: M.text }}
    >
      <div className="grid lg:grid-cols-[1fr_1.05fr]">
        <div className="p-5 sm:p-6">
          <Matrices t={time} state={state} data={data} focus={focus} />
        </div>
        <div className="relative min-h-[340px] border-t border-white/10 lg:border-l lg:border-t-0">
          <Canvas
            camera={{ position: [2.55, 1.75, 2.55], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
          >
            <color attach="background" args={[M.bg]} />
            <Scene stateRef={stateRef} labels={labels} reduced={reduced} />
          </Canvas>
          <div className="pointer-events-none absolute inset-0 overflow-hidden font-serif text-[15px] italic">
            {Array.from({ length: USERS + ITEMS }, (_, i) => (
              <span
                key={i}
                ref={(el) => {
                  labels.current[i] = el;
                }}
                className="absolute left-0 top-0 will-change-transform"
                style={{ color: i < USERS ? M.blue : M.yellow, opacity: 0 }}
              >
                {i < USERS ? "u" : "v"}
                <sub className="text-[10px] not-italic">
                  {i < USERS ? i + 1 : i - USERS + 1}
                </sub>
              </span>
            ))}
          </div>
          <div
            className="pointer-events-none absolute left-4 top-4 font-serif text-sm"
            style={{ color: M.dim }}
          >
            <span style={{ color: M.blue }}>u</span> users ·{" "}
            <span style={{ color: M.yellow }}>v</span> items · ℝ³
          </div>
        </div>
      </div>

      <div className="grid items-center gap-5 border-t border-white/10 px-5 py-4 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="min-h-[56px]">
          <AnimatePresence mode="wait">
            <motion.p
              key={caption}
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1 }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="font-serif text-lg leading-snug sm:text-xl"
            >
              {caption}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 font-serif text-[15px]" style={{ color: M.dim }}>
            <span className="italic">L</span> = Σ<sub>observed</sub> (r
            <sub>ui</sub> − μ − u<sub>u</sub>·v<sub>i</sub>)² + λ(‖U‖² + ‖V‖²)
            {time >= T_PRED && (
              <span style={{ color: M.green }}>
                {" "}
                · {held.exact}/{held.total} hidden ratings recovered
              </span>
            )}
          </p>
        </div>
        <LossCurve data={data} epoch={epoch} />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 px-5 py-3 sm:px-6">
        <button
          onClick={replay}
          className="flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
        >
          <RotateCcw size={13} /> Replay
        </button>
        <label
          className="flex flex-1 items-center gap-3 text-sm"
          style={{ color: M.dim }}
        >
          <span className="font-serif italic">epoch</span>
          <input
            type="range"
            min={0}
            max={EPOCHS - 1}
            step={0.1}
            value={epoch}
            onChange={(e) => setManualEpoch(parseFloat(e.target.value))}
            className="h-1 flex-1 cursor-pointer"
            style={{ accentColor: M.teal }}
            aria-label="Scrub training epoch"
          />
          <span className="w-10 text-right font-mono text-white">
            {Math.round(epoch)}
          </span>
        </label>
      </div>
    </div>
  );
}
