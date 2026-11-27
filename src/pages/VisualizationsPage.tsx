import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick } from "lucide-react";
import { GROUPS } from "../lib/groups";
import { fadeUp, stagger } from "../lib/motion";
import { playPop } from "../lib/sound";
import { PageContainer } from "../components/ui";
import { SectionIndex, type IndexSection } from "../components/SectionIndex";
import { SHOWCASES, ShowcaseBlock } from "../components/Showcase";

/* Every domain's interactive demo on one page, in domain order. */

const ENTRIES = GROUPS.flatMap((g) => {
  const showcase = SHOWCASES[g.id];
  return showcase ? [{ group: g, showcase }] : [];
});

const shortName = (label: string, short: string) =>
  short === "ML" || short === "AI" ? short : label;

export function VisualizationsPage() {
  const sections: IndexSection[] = [
    { id: "intro", label: "Visualizations", icon: MousePointerClick },
    ...ENTRIES.map(({ group }) => ({
      id: `viz-${group.id}`,
      label: shortName(group.label, group.short),
      icon: group.icon,
      color: group.cssVar,
    })),
  ];

  return (
    <div>
      <SectionIndex sections={sections} />

      <section id="intro" className="pb-6 pt-28 md:pb-10 md:pt-36">
        <PageContainer>
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger(0.08, 0.05)}
            className="max-w-[46rem]"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-extrabold uppercase tracking-[0.14em]"
              style={{ color: "rgb(var(--accent))" }}
            >
              Visualizations
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="mt-3 text-[clamp(2.6rem,7vw,4.8rem)] font-black leading-[1.02] tracking-[-0.03em] text-fg"
            >
              Four demos,{" "}
              <span style={{ color: "rgb(var(--accent))" }}>
                one per domain
              </span>
              .
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-5 text-lg leading-relaxed text-fg/90 sm:text-xl sm:leading-relaxed"
            >
              Each one is built from work I&rsquo;ve done and runs live in your
              browser. Press the buttons, break things, and watch what happens.
            </motion.p>
            <motion.ul
              variants={fadeUp}
              className="mt-7 flex flex-wrap gap-2.5"
              aria-label="Jump to a demo"
            >
              {ENTRIES.map(({ group }, i) => {
                const Icon = group.icon;
                return (
                  <li key={group.id}>
                    <a
                      href={`#viz-${group.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        playPop(0.9 + i * 0.08);
                        document
                          .getElementById(`viz-${group.id}`)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-tile px-3.5 py-2 text-sm font-extrabold transition-transform hover:-translate-y-0.5"
                      style={{ color: `rgb(var(${group.cssVar}))` }}
                    >
                      <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
                      {shortName(group.label, group.short)}
                    </a>
                  </li>
                );
              })}
            </motion.ul>
          </motion.div>
        </PageContainer>
      </section>

      {ENTRIES.map(({ group, showcase }, i) => (
        <section
          key={group.id}
          id={`viz-${group.id}`}
          className="scroll-mt-24 py-10 md:py-14"
        >
          <PageContainer>
            <ShowcaseBlock
              showcase={showcase}
              color={group.cssVar}
              kicker={`${group.label} · ${showcase.eyebrow}`}
              footer={
                <Link
                  to={group.path}
                  onClick={() => playPop(0.95 + i * 0.06)}
                  className="inline-flex items-center gap-1.5 text-base font-extrabold underline decoration-2 underline-offset-4"
                  style={{
                    color: `rgb(var(${group.cssVar}))`,
                    textDecorationColor: `rgb(var(${group.cssVar}) / 0.35)`,
                  }}
                >
                  See {shortName(group.label, group.short)} projects
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              }
            />
          </PageContainer>
        </section>
      ))}
    </div>
  );
}
