import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown, MapPin } from "lucide-react";
import type { Experience } from "../lib/content";
import { GroupBadge } from "./ui";
import { TechPill } from "./TechLogo";
import type { GroupId } from "../lib/groups";
import { ease, fadeUp, stagger } from "../lib/motion";

/** True when an end date like "December 2026" is missing, "Present", or not yet past. */
export function isOngoing(endDate?: string) {
  if (!endDate || /present/i.test(endDate)) return true;
  const parsed = new Date(`1 ${endDate}`);
  if (Number.isNaN(parsed.getTime())) return false;
  const endOfMonth = new Date(
    parsed.getFullYear(),
    parsed.getMonth() + 1,
    0,
    23,
    59,
  );
  return endOfMonth >= new Date();
}

export function ExperienceTimeline({
  experiences,
  compact = false,
}: {
  experiences: Experience[];
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [open, setOpen] = useState<string | null>(
    compact ? null : (experiences[0]?._id ?? null),
  );

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={stagger(0.08)}
    >
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line/10 md:left-[calc(11rem+7px)]" />
      <motion.div
        style={{ scaleY: progress }}
        className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-accent via-ml to-systems md:left-[calc(11rem+7px)]"
      />
      <ol className="space-y-3">
        {experiences.map((exp) => {
          const isOpen = open === exp._id;
          const current = isOngoing(exp.endDate);
          return (
            <motion.li
              key={exp._id}
              variants={fadeUp}
              className="relative grid gap-2 pl-8 md:grid-cols-[11rem_1fr] md:gap-0 md:pl-0"
            >
              <div className="pt-5 font-mono text-[11px] leading-5 text-subtle md:pr-10 md:text-right">
                {exp.startDate.replace(/(\w{3})\w* (\d{4})/, "$1 $2")}
                <span className="mx-1">→</span>
                {(exp.endDate ?? "Present").replace(
                  /(\w{3})\w* (\d{4})/,
                  "$1 $2",
                )}
              </div>
              <span
                className={`absolute left-0 top-[22px] z-10 h-[15px] w-[15px] rounded-full border-[3px] shadow-[0_0_0_4px_rgb(var(--bg))] md:left-[11rem] ${
                  current ? "border-accent bg-accent" : "border-muted bg-bg"
                }`}
              >
                {current && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
                )}
              </span>
              <div className="md:pl-10">
                <button
                  onClick={() => setOpen(isOpen ? null : exp._id)}
                  aria-expanded={isOpen}
                  className={`group w-full rounded-lg px-5 py-4 text-left transition-colors hover:bg-fg/[0.045] ${isOpen ? "bg-fg/[0.045]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-fg">
                        {exp.company}
                      </h3>
                      <p className="text-sm text-muted">{exp.position}</p>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`mt-1 shrink-0 text-subtle transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                  {exp.summary && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {exp.summary}
                    </p>
                  )}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-4 space-y-2.5 border-t hairline pt-4">
                          {exp.description.map((d, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.05 * i + 0.1 }}
                              className="flex gap-3 text-sm leading-relaxed text-fg/85"
                            >
                              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-subtle" />
                              {d}
                            </motion.li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="mr-2 inline-flex items-center gap-1 font-mono text-[11px] text-subtle">
                            <MapPin size={11} /> {exp.location}
                          </span>
                          {(exp.groups ?? []).map((g) => (
                            <GroupBadge
                              key={g}
                              id={g as GroupId}
                              link={false}
                            />
                          ))}
                          {exp.technologies.map((t) => (
                            <TechPill key={t} name={t} size="sm" />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </motion.div>
  );
}
