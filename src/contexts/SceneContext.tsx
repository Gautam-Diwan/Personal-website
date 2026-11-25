import { createContext, useContext, useEffect, useState } from "react";
import type { SceneShape } from "../lib/groups";

type SceneCtx = {
  override: SceneShape | null;
  setOverride: (s: SceneShape | null) => void;
};

const Ctx = createContext<SceneCtx>({ override: null, setOverride: () => {} });

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = useState<SceneShape | null>(null);
  return <Ctx.Provider value={{ override, setOverride }}>{children}</Ctx.Provider>;
}

export const useSceneOverride = () => useContext(Ctx).override;

/** Let a page choose the background shape while it is mounted. */
export function useSetScene(shape: SceneShape | null | undefined) {
  const { setOverride } = useContext(Ctx);
  useEffect(() => {
    if (!shape) return;
    setOverride(shape);
    return () => setOverride(null);
  }, [shape, setOverride]);
}
