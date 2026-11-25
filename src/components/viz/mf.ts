/**
 * Matrix factorization R ≈ μ + U Vᵀ trained with SGD on observed entries only.
 * Everything is seeded so the animation is identical on every load.
 */

export const USERS = 6;
export const ITEMS = 8;
export const K = 3;
export const EPOCHS = 90;

export type Snapshot = { U: number[][]; V: number[][]; rmse: number };
export type MFData = {
  ratings: (number | null)[][]; // observed ratings, null when missing
  truth: number[][]; // full ground-truth matrix (to check predictions)
  mu: number;
  snaps: Snapshot[];
};

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647), s / 2147483647);
}

function gaussian(rand: () => number) {
  const u = 1 - rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

const dot = (a: number[], b: number[]) =>
  a.reduce((s, x, i) => s + x * b[i], 0);
export const clampRating = (r: number) => Math.min(5, Math.max(1, r));

export type MFOptions = {
  seed?: number;
  observe?: number;
  reg?: number;
  lr?: number;
  truthRank?: number;
  scale?: number;
};

// Defaults chosen by sweeping seeds: rank-2 truth, 60% observed. RMSE 1.40 -> 0.09 on observed,
// and 20 of 21 held-out cells are predicted exactly after rounding (MAE 0.16).
export function trainMF({
  seed = 48,
  observe = 0.6,
  reg = 0.05,
  lr = 0.05,
  truthRank = 2,
  scale = 0.85,
}: MFOptions = {}): MFData {
  const rand = rng(seed);
  // Ground-truth low-rank tastes
  const Ut = Array.from({ length: USERS }, () =>
    Array.from({ length: K }, (_, f) =>
      f < truthRank ? gaussian(rand) * scale : 0,
    ),
  );
  const Vt = Array.from({ length: ITEMS }, () =>
    Array.from({ length: K }, (_, f) =>
      f < truthRank ? gaussian(rand) * scale : 0,
    ),
  );
  const truth = Ut.map((u) =>
    Vt.map((v) => Math.round(clampRating(3 + 1.5 * dot(u, v)))),
  );

  // Observe a fraction of entries, at least 3 per user
  const ratings: (number | null)[][] = truth.map((row) =>
    row.map((r) => (rand() < observe ? r : null)),
  );
  ratings.forEach((row, u) => {
    let seen = row.filter((x) => x !== null).length;
    for (let i = 0; seen < 3 && i < ITEMS; i++) {
      if (row[i] === null) {
        row[i] = truth[u][i];
        seen++;
      }
    }
  });

  const observed: [number, number, number][] = [];
  ratings.forEach((row, u) =>
    row.forEach((r, i) => r !== null && observed.push([u, i, r])),
  );
  const mu = observed.reduce((s, [, , r]) => s + r, 0) / observed.length;

  const U = Array.from({ length: USERS }, () =>
    Array.from({ length: K }, () => gaussian(rand) * 0.12),
  );
  const V = Array.from({ length: ITEMS }, () =>
    Array.from({ length: K }, () => gaussian(rand) * 0.12),
  );

  const rmse = () =>
    Math.sqrt(
      observed.reduce(
        (s, [u, i, r]) => s + (r - mu - dot(U[u], V[i])) ** 2,
        0,
      ) / observed.length,
    );
  const copy = () => ({
    U: U.map((r) => [...r]),
    V: V.map((r) => [...r]),
    rmse: rmse(),
  });

  const snaps: Snapshot[] = [copy()];
  for (let e = 1; e < EPOCHS; e++) {
    // shuffle order each epoch
    const order = [...observed].sort(() => rand() - 0.5);
    for (const [u, i, r] of order) {
      const err = r - mu - dot(U[u], V[i]);
      for (let f = 0; f < K; f++) {
        const uf = U[u][f];
        U[u][f] += lr * (err * V[i][f] - reg * uf);
        V[i][f] += lr * (err * uf - reg * V[i][f]);
      }
    }
    snaps.push(copy());
  }
  return { ratings, truth, mu, snaps };
}

/** Linearly interpolate between epoch snapshots for smooth playback. */
export function stateAt(snaps: Snapshot[], epoch: number): Snapshot {
  const e0 = Math.max(0, Math.min(snaps.length - 1, Math.floor(epoch)));
  const e1 = Math.min(snaps.length - 1, e0 + 1);
  const t = Math.max(0, Math.min(1, epoch - e0));
  const lerp = (a: number[][], b: number[][]) =>
    a.map((row, r) => row.map((x, c) => x + (b[r][c] - x) * t));
  return {
    U: lerp(snaps[e0].U, snaps[e1].U),
    V: lerp(snaps[e0].V, snaps[e1].V),
    rmse: snaps[e0].rmse + (snaps[e1].rmse - snaps[e0].rmse) * t,
  };
}

export const predict = (mu: number, u: number[], v: number[]) => mu + dot(u, v);
