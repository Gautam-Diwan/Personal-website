import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const PROMPT = "Did Gautam ever take an acting course?";
const ANSWER = "Yes! Gautam took Acting for Non-Majors in Spring 2026.";
const STEPS = 14;
const NOISE = "▖▗▘▙▚▛▜▝▞▟░▒▓#%&@$*+=?<>~";

/** Words, punctuation, and digits as separate tokens, each keeping its trailing space. */
const TOKENS = ANSWER.match(
  /[A-Za-z]+(?:-[A-Za-z]+)*\s*|\d+\s*|[^\sA-Za-z\d]\s*/g,
) ?? [ANSWER];

/** Deterministic shuffle so each replay unmasks in a scattered (non left-to-right) order. */
function unmaskOrder(n: number, seed: number) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

const noise = (len: number) =>
  Array.from(
    { length: len },
    () => NOISE[Math.floor(Math.random() * NOISE.length)],
  ).join("");

type Phase = "idle" | "typing" | "thinking" | "denoising" | "done";

export function DiffusionTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);
  const [, setTick] = useState(0); // re-roll noise glyphs
  const order = useMemo(() => unmaskOrder(TOKENS.length, 17 + run * 31), [run]);

  // Cosine schedule: few tokens commit early, most commit in the middle steps
  const revealedCount = Math.round(
    TOKENS.length * (1 - Math.cos((Math.PI / 2) * (step / STEPS))),
  );
  const revealed = useMemo(
    () => new Set(order.slice(0, revealedCount)),
    [order, revealedCount],
  );

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setTyped(PROMPT);
      setStep(STEPS);
      setPhase("done");
      return;
    }
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));

    (async () => {
      setPhase("typing");
      setTyped("");
      setStep(0);
      for (let i = 1; i <= PROMPT.length; i++) {
        if (cancelled) return;
        setTyped(PROMPT.slice(0, i));
        await wait(28 + Math.random() * 40);
      }
      setPhase("thinking");
      await wait(450);
      setPhase("denoising");
      for (let s = 0; s <= STEPS; s++) {
        if (cancelled) return;
        setStep(s);
        // a few noise re-rolls between commits so masked slots shimmer
        for (let k = 0; k < 3; k++) {
          setTick((t) => t + 1);
          await wait(55);
        }
      }
      if (cancelled) return;
      setPhase("done");
      await wait(6500);
      if (!cancelled) setRun((r) => r + 1);
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [inView, run, reduced]);

  const showAnswer = phase === "denoising" || phase === "done";

  return (
    <div
      ref={ref}
      className="card overflow-hidden font-mono text-[13px] shadow-[0_20px_80px_-20px_rgb(var(--ai)/0.25)]"
    >
      <div className="flex items-center justify-between border-b hairline px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-[11px] text-subtle">
            ask-gautam · masked text diffusion
          </span>
        </div>
        <button
          onClick={() => setRun((r) => r + 1)}
          className="grid h-7 w-7 place-items-center rounded-md text-subtle transition-colors hover:bg-fg/5 hover:text-fg"
          aria-label="Replay"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      <div className="min-h-[230px] space-y-5 p-5 sm:p-6" aria-live="polite">
        <div className="flex gap-3">
          <span className="shrink-0 text-web">you ›</span>
          <span className="text-fg">
            {typed}
            {phase === "typing" && (
              <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-fg/70" />
            )}
          </span>
        </div>

        {phase === "thinking" && (
          <div className="flex gap-3 text-subtle">
            <span className="shrink-0 text-ai">gd ›</span>
            <span className="animate-pulse">
              sampling {TOKENS.length} masked tokens…
            </span>
          </div>
        )}

        {showAnswer && (
          <div className="flex gap-3">
            <span className="shrink-0 text-ai">gd ›</span>
            <p
              className="leading-7 text-fg"
              aria-label={phase === "done" ? ANSWER : undefined}
            >
              {TOKENS.map((tok, i) => {
                const word = tok.trimEnd();
                const space = tok.slice(word.length);
                return revealed.has(i) ? (
                  <motion.span
                    key={`r${run}-${i}`}
                    initial={{
                      color: "rgb(var(--ai))",
                      filter: "blur(3px)",
                      opacity: 0.4,
                    }}
                    animate={{
                      color: "rgb(var(--fg))",
                      filter: "blur(0px)",
                      opacity: 1,
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    {word}
                    {space}
                  </motion.span>
                ) : (
                  <span key={`m${run}-${i}`}>
                    <span className="rounded-sm bg-ai/10 text-ai/60">
                      {noise(word.length)}
                    </span>
                    {space}
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {showAnswer && (
          <div className="flex items-center gap-3 pl-[3.25rem] text-[11px] text-subtle">
            <span>
              step {String(step).padStart(2, "0")}/{STEPS}
            </span>
            <span className="relative h-1 w-28 overflow-hidden rounded-full bg-line/10">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-ai transition-[width] duration-150"
                style={{ width: `${(step / STEPS) * 100}%` }}
              />
            </span>
            <span>
              {revealedCount}/{TOKENS.length} unmasked
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
