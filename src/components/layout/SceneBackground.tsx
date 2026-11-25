import { lazy, Suspense, useMemo } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { isGroupId, type SceneShape } from "../../lib/groups";

const ParticleField = lazy(() => import("../three/ParticleField"));

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function useRouteShape(): SceneShape {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const seg = pathname.split("/").filter(Boolean)[0] ?? "";
  return isGroupId(seg) ? seg : "home";
}

export function SceneBackground() {
  const { isDark } = useDarkMode();
  const reducedMotion = !!useReducedMotion();
  const webgl = useMemo(hasWebGL, []);
  const shape = useRouteShape();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 700], [1, 0.14]);
  const scale = useTransform(scrollY, [0, 700], [1, 0.9]);
  const glowVar = shape === "home" ? "accent" : shape;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="grid-bg absolute inset-0" />
      <div
        className="absolute -top-48 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl transition-[background] duration-1000"
        style={{
          background: `radial-gradient(closest-side, rgb(var(--${glowVar}) / ${
            isDark ? 0.16 : 0.1
          }), transparent)`,
        }}
      />
      {webgl && (
        <motion.div className="absolute inset-0" style={{ opacity, scale }}>
          <Suspense fallback={null}>
            <ParticleField
              shape={shape}
              align="right"
              isDark={isDark}
              reducedMotion={reducedMotion}
            />
          </Suspense>
        </motion.div>
      )}
    </div>
  );
}
