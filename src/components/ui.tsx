import { motion, type HTMLMotionProps } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { GROUP_BY_ID, type GroupId } from "../lib/groups";
import { fadeUp, stagger } from "../lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger(0.08, delay)}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  children,
  center = false,
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  center?: boolean;
}) {
  if (center) {
    return (
      <Reveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center md:mb-14">
        <RevealItem className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-line/30" />
          {index && <span className="text-fg">{index}</span>}
          {eyebrow}
          <span className="h-px w-8 bg-line/30" />
        </RevealItem>
        <RevealItem>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>
        </RevealItem>
        {children && (
          <RevealItem className="mt-4 text-base text-muted">
            {children}
          </RevealItem>
        )}
      </Reveal>
    );
  }
  return (
    <Reveal className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
      <div>
        <RevealItem className="eyebrow flex items-center gap-3">
          {index && <span className="text-fg">{index}</span>}
          <span className="h-px w-8 bg-line/20" />
          {eyebrow}
        </RevealItem>
        <RevealItem>
          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h2>
        </RevealItem>
      </div>
      {children && (
        <RevealItem className="max-w-md text-sm text-muted md:text-right">
          {children}
        </RevealItem>
      )}
    </Reveal>
  );
}

export function GroupBadge({
  id,
  link = true,
}: {
  id: GroupId;
  link?: boolean;
}) {
  const g = GROUP_BY_ID[id];
  const cls =
    "relative z-10 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider transition-colors";
  const style = {
    color: `rgb(var(${g.cssVar}))`,
    borderColor: `rgb(var(${g.cssVar}) / 0.3)`,
    background: `rgb(var(${g.cssVar}) / 0.08)`,
  };
  const inner = (
    <>
      <span
        className="h-1 w-1 rounded-full"
        style={{ background: "currentColor" }}
      />
      {g.short}
    </>
  );
  return link ? (
    <Link
      to={g.path}
      className={cls + " hover:brightness-125"}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {inner}
    </Link>
  ) : (
    <span className={cls} style={style}>
      {inner}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-fg/[0.05] ${className}`} />
  );
}

export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-page px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
