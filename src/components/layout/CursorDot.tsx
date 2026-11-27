import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const SIZE = 4;
const RING = 34;
const INTERACTIVE =
  "a, button, [role='button'], input, textarea, select, label, summary";

/*
 * A small accent dot that trails the pointer on a spring. Mouse and trackpad
 * only: it never mounts on touch screens or with reduced motion. Positions are
 * motion values, so moving the mouse never re-renders React.
 */
export function CursorDot() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  // soft, slightly lagging follow; critically damped enough not to wobble
  const spring = { stiffness: 380, damping: 34, mass: 0.6 };
  const x = useSpring(mx, spring);
  const y = useSpring(my, spring);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let first = true;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx.set(e.clientX);
      my.set(e.clientY);
      if (first) {
        // start at the pointer instead of flying in from the corner
        x.jump(e.clientX);
        y.jump(e.clientY);
        first = false;
      }
      setVisible(true);
    };
    const over = (e: PointerEvent) =>
      setHovering(!!(e.target as Element | null)?.closest?.(INTERACTIVE));
    const leave = () => setVisible(false);
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled, mx, my, x, y]);

  if (!enabled) return null;

  const t = { type: "spring", stiffness: 420, damping: 30, mass: 0.5 } as const;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ x, y }}
      animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.75 : 1 }}
      transition={t}
    >
      {/* filled dot, the resting state */}
      <motion.span
        className="absolute rounded-full"
        style={{
          width: SIZE,
          height: SIZE,
          left: -SIZE / 2,
          top: -SIZE / 2,
          background: "rgb(var(--accent))",
        }}
        animate={{ opacity: hovering ? 0 : 1, scale: hovering ? 0.4 : 1 }}
        transition={t}
      />
      {/* outline ring over anything clickable, so it reads on any colour */}
      <motion.span
        className="absolute rounded-full border-2"
        style={{
          width: RING,
          height: RING,
          left: -RING / 2,
          top: -RING / 2,
          borderColor: "rgb(var(--fg) / 0.85)",
          // a halo in the page colour keeps the ring visible on bright fills too
          boxShadow:
            "0 0 0 1.5px rgb(var(--bg) / 0.7), inset 0 0 0 1.5px rgb(var(--bg) / 0.7)",
        }}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.3 }}
        transition={t}
      />
    </motion.div>
  );
}
