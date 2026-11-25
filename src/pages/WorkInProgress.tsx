import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { PageContainer } from "../components/ui";
import { fadeUp, stagger } from "../lib/motion";
import { GROUPS } from "../lib/groups";
import { playPop } from "../lib/sound";

/** Blog placeholder, written in the home page's voice and layout. */
export function WorkInProgress() {
  return (
    <PageContainer className="flex min-h-[80svh] items-center pb-16 pt-28 md:pt-36">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger(0.08, 0.05)}
        className="max-w-[44rem]"
      >
        <motion.p
          variants={fadeUp}
          className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.14em]"
          style={{ color: "rgb(var(--systems))" }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-systems opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-systems" />
          </span>
          Work in progress
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-3 text-[clamp(2.8rem,7vw,5.2rem)] font-black leading-[1.02] tracking-[-0.03em] text-fg"
        >
          The blog is{" "}
          <span style={{ color: "rgb(var(--accent))" }}>still compiling</span>.
        </motion.h1>
        <motion.div
          variants={fadeUp}
          className="mt-7 space-y-5 text-lg leading-relaxed text-fg/90 sm:text-xl sm:leading-relaxed"
        >
          <p>
            I&rsquo;m writing about the things I spend my time on: GPU kernels
            that chase cuBLAS, buffer pools that survive concurrency, and LLM
            agents that don&rsquo;t fall over halfway through a long run.
          </p>
          <p className="text-muted">
            Until the first post ships, the projects say most of it. Pick a
            lens:{" "}
            {GROUPS.map((g, i) => (
              <span key={g.id}>
                <Link
                  to={g.path}
                  onClick={() => playPop(0.9 + i * 0.08)}
                  className="font-bold underline decoration-2 underline-offset-4"
                  style={{
                    color: `rgb(var(${g.cssVar}))`,
                    textDecorationColor: `rgb(var(${g.cssVar}) / 0.45)`,
                  }}
                >
                  {g.id === "ml" || g.id === "ai"
                    ? g.id.toUpperCase()
                    : g.label}
                </Link>
                {i < GROUPS.length - 2
                  ? ", "
                  : i === GROUPS.length - 2
                    ? ", or "
                    : "."}
              </span>
            ))}
          </p>
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-wrap items-center gap-6"
        >
          <Link to="/" onClick={() => playPop(0.9)} className="btn-primary">
            <ArrowLeft size={18} /> Back home
          </Link>
          <a
            href="mailto:gdiwan@cs.cmu.edu?subject=Blog%20topic%20idea"
            className="btn-ghost"
          >
            <Mail size={18} /> Suggest a topic
          </a>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
