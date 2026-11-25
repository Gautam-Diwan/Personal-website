/**
 * Adaptive Replacement Cache (Megiddo & Modha) driving a fixed set of buffer pool frames.
 * Lists are ordered LRU (index 0) to MRU (end). Every step is precomputed so the
 * visualization can scrub forward and backward.
 */

export type Access = {
  page: string;
  op: "scanO" | "scanC";
  /** tuples produced by this page access (heap pages only) */
  tuples?: number;
  /** a successful join lookup */
  joined?: boolean;
};

export type ArcResult = "hit" | "miss" | "ghost";

export type ArcSnapshot = {
  frames: (string | null)[];
  T1: string[];
  T2: string[];
  B1: string[];
  B2: string[];
  p: number;
  result?: ArcResult;
  frame?: number;
  evicted?: string | null;
  access?: Access;
};

export function simulateArc(trace: Access[], c: number): ArcSnapshot[] {
  const T1: string[] = [];
  const T2: string[] = [];
  const B1: string[] = [];
  const B2: string[] = [];
  let p = 0;
  const frames: (string | null)[] = Array(c).fill(null);
  const snaps: ArcSnapshot[] = [{ frames: [...frames], T1: [], T2: [], B1: [], B2: [], p }];

  const remove = (l: string[], x: string) => {
    const i = l.indexOf(x);
    if (i >= 0) l.splice(i, 1);
  };
  const full = () => T1.length + T2.length >= c;
  /** Evict the LRU of T1 or T2 into its ghost list; returns the evicted page. */
  const replace = (hitInB2: boolean): string => {
    if (T1.length > 0 && ((hitInB2 && T1.length === p) || T1.length > p)) {
      const v = T1.shift()!;
      B1.push(v);
      return v;
    }
    const v = T2.shift()!;
    B2.push(v);
    return v;
  };

  for (const access of trace) {
    const x = access.page;
    let result: ArcResult;
    let evicted: string | null = null;

    if (T1.includes(x) || T2.includes(x)) {
      result = "hit";
      remove(T1, x);
      remove(T2, x);
      T2.push(x);
    } else if (B1.includes(x)) {
      result = "ghost";
      p = Math.min(c, p + Math.max(B2.length / B1.length, 1));
      if (full()) evicted = replace(false);
      remove(B1, x);
      T2.push(x);
    } else if (B2.includes(x)) {
      result = "ghost";
      p = Math.max(0, p - Math.max(B1.length / B2.length, 1));
      if (full()) evicted = replace(true);
      remove(B2, x);
      T2.push(x);
    } else {
      result = "miss";
      if (T1.length + B1.length === c) {
        if (T1.length < c) {
          B1.shift();
          if (full()) evicted = replace(false);
        } else {
          evicted = T1.shift()!;
        }
      } else {
        const total = T1.length + T2.length + B1.length + B2.length;
        if (total >= c) {
          if (total === 2 * c) B2.shift();
          if (full()) evicted = replace(false);
        }
      }
      T1.push(x);
    }

    let frame: number;
    if (result === "hit") {
      frame = frames.indexOf(x);
    } else {
      frame = evicted ? frames.indexOf(evicted) : frames.indexOf(null);
      frames[frame] = x;
    }

    snaps.push({
      frames: [...frames],
      T1: [...T1],
      T2: [...T2],
      B1: [...B1],
      B2: [...B2],
      p,
      result,
      frame,
      evicted,
      access,
    });
  }
  return snaps;
}

/**
 * Page accesses for an index nested-loop join: walk the orders date index leaf by leaf,
 * fetch each heap page once, and probe the customers primary key per tuple. Customer
 * ids are skewed so a few hot pages get re-referenced, which ARC promotes to T2.
 */
export function buildJoinTrace(): Access[] {
  let s = 42;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const hot = [2, 5, 7];
  const trace: Access[] = [{ page: "ix:root", op: "scanO" }];
  let heap = 12;
  for (const leaf of ["ix:L3", "ix:L4", "ix:L5", "ix:L6"]) {
    trace.push({ page: leaf, op: "scanO" });
    for (let h = 0; h < 2; h++) {
      trace.push({ page: `o:${heap++}`, op: "scanO", tuples: 2 });
      for (let t = 0; t < 2; t++) {
        const cust = rand() < 0.6 ? hot[Math.floor(rand() * hot.length)] : Math.floor(rand() * 14);
        trace.push({ page: "pk:root", op: "scanC" });
        trace.push({ page: `c:${cust}`, op: "scanC", joined: true });
      }
    }
  }
  return trace;
}
