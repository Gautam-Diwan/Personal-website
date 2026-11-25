import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, PenLine } from "lucide-react";
import { PageContainer } from "../components/ui";
import { fadeUp, stagger } from "../lib/motion";

export function WorkInProgress() {
  return (
    <PageContainer className="flex min-h-[80svh] items-center pb-16 pt-32">
      <motion.div initial="hidden" animate="show" variants={stagger(0.09, 0.1)} className="max-w-2xl">
        <motion.div
          variants={fadeUp}
          className="inline-flex items-center gap-2.5 rounded-full border hairline bg-surface/50 py-1.5 pl-2 pr-4 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-systems opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-systems" />
          </span>
          <span className="text-xs text-muted">Work in progress</span>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="mt-8 text-[clamp(2.6rem,7vw,5rem)] font-black leading-[1.02] tracking-[-0.035em]"
        >
          The blog is <span style={{ color: "rgb(var(--accent))" }}>still compiling.</span>
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-6 max-w-lg leading-relaxed text-muted">
          Writing on ML systems, GPU kernels, and building agents that survive production is on the
          way. Until then, the projects say most of it.
        </motion.p>
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3">
          <Link to="/" className="btn-primary group">
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            Back to projects
          </Link>
          <a href="mailto:gdiwan@cs.cmu.edu" className="btn-ghost">
            <PenLine size={15} /> Suggest a topic
          </a>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
