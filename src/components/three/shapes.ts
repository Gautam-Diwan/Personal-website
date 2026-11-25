import type { SceneShape } from "../../lib/groups";

/** Deterministic PRNG so shapes are stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TAU = Math.PI * 2;

function gauss(rand: () => number) {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

type Writer = (i: number, x: number, y: number, z: number) => void;

function home(n: number, w: Writer, rand: () => number) {
  // Fibonacci sphere core with a tilted orbital ring
  const sphere = Math.floor(n * 0.72);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < sphere; i++) {
    const y = 1 - (i / (sphere - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 1.75 + gauss(rand) * 0.035;
    w(i, Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
  }
  const tilt = 0.42;
  for (let i = sphere; i < n; i++) {
    const a = rand() * TAU;
    const R = 2.5 + Math.pow(rand(), 2) * 0.9;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    const y = gauss(rand) * 0.03;
    w(i, x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt));
  }
}

function systems(n: number, w: Writer, rand: () => number) {
  // A lattice of grid lines inside a cube: memory banks / interconnect
  const cells = 5;
  const half = 1.5;
  const step = (2 * half) / cells;
  const snap = () => -half + Math.floor(rand() * (cells + 1)) * step;
  for (let i = 0; i < n; i++) {
    const axis = Math.floor(rand() * 3);
    const t = -half + rand() * 2 * half;
    const a = snap();
    const b = snap();
    const j = () => gauss(rand) * 0.012;
    if (axis === 0) w(i, t, a + j(), b + j());
    else if (axis === 1) w(i, a + j(), t, b + j());
    else w(i, a + j(), b + j(), t);
  }
}

function ml(n: number, w: Writer, rand: () => number) {
  // Layers of neurons with connections between adjacent layers
  const layers = [4, 7, 9, 7, 4];
  const spacing = 1.15;
  const neurons: [number, number, number][][] = layers.map((count, li) => {
    const x = (li - (layers.length - 1) / 2) * spacing;
    return Array.from({ length: count }, (_, k) => {
      const y = (k - (count - 1) / 2) * 0.42;
      return [x, y, 0] as [number, number, number];
    });
  });
  const nodeShare = Math.floor(n * 0.45);
  const flat = neurons.flat();
  for (let i = 0; i < nodeShare; i++) {
    const [x, y, z] = flat[i % flat.length];
    const r = 0.09 * Math.cbrt(rand());
    const th = rand() * TAU;
    const ph = Math.acos(2 * rand() - 1);
    w(i, x + r * Math.sin(ph) * Math.cos(th), y + r * Math.sin(ph) * Math.sin(th), z + r * Math.cos(ph));
  }
  for (let i = nodeShare; i < n; i++) {
    const li = Math.floor(rand() * (layers.length - 1));
    const a = neurons[li][Math.floor(rand() * neurons[li].length)];
    const b = neurons[li + 1][Math.floor(rand() * neurons[li + 1].length)];
    const t = rand();
    w(i, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, gauss(rand) * 0.01);
  }
}

function ai(n: number, w: Writer, rand: () => number) {
  // Three-armed spiral galaxy with a bright core
  const arms = 3;
  for (let i = 0; i < n; i++) {
    if (rand() < 0.14) {
      const r = Math.abs(gauss(rand)) * 0.28;
      const th = rand() * TAU;
      const ph = Math.acos(2 * rand() - 1);
      w(i, r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th));
      continue;
    }
    const r = 0.25 + Math.pow(rand(), 0.8) * 2.6;
    const arm = Math.floor(rand() * arms);
    const th = r * 1.35 + (arm / arms) * TAU + gauss(rand) * 0.16 * (1 + r * 0.25);
    const spread = gauss(rand) * 0.07 * r;
    w(i, Math.cos(th) * r + spread, gauss(rand) * 0.06 * (2.8 - r), Math.sin(th) * r + spread);
  }
}

function web(n: number, w: Writer, rand: () => number) {
  // Wireframe globe: latitude and longitude lines plus orbiting links
  const R = 1.9;
  const arcs = Math.floor(n * 0.16);
  for (let i = 0; i < n - arcs; i++) {
    let lat: number;
    let lon: number;
    if (rand() < 0.5) {
      lat = (Math.floor(rand() * 11) - 5) * (Math.PI / 12);
      lon = rand() * TAU;
    } else {
      lon = Math.floor(rand() * 16) * (TAU / 16);
      lat = (rand() - 0.5) * Math.PI;
    }
    w(i, R * Math.cos(lat) * Math.cos(lon), R * Math.sin(lat), R * Math.cos(lat) * Math.sin(lon));
  }
  // Great-circle arcs lifted off the surface, like requests between nodes
  const links = 9;
  const local = mulberry32(7);
  const ends = Array.from({ length: links }, () => {
    const p = () => {
      const lat = (local() - 0.5) * 2.2;
      const lon = local() * TAU;
      return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
    };
    return [p(), p()];
  });
  for (let i = n - arcs; i < n; i++) {
    const [a, b] = ends[i % links];
    const t = rand();
    const x = a[0] + (b[0] - a[0]) * t;
    const y = a[1] + (b[1] - a[1]) * t;
    const z = a[2] + (b[2] - a[2]) * t;
    const len = Math.hypot(x, y, z) || 1;
    const lift = R * (1 + 0.32 * Math.sin(Math.PI * t));
    w(i, (x / len) * lift, (y / len) * lift, (z / len) * lift);
  }
}

const builders: Record<SceneShape, typeof home> = { home, systems, ml, ai, web };

export function buildShape(shape: SceneShape, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  const rand = mulberry32(shape.length * 977 + 13);
  builders[shape](
    n,
    (i, x, y, z) => {
      out[i * 3] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = z;
    },
    rand,
  );
  return out;
}
