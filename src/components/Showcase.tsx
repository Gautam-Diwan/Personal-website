import { motion } from "framer-motion";
import { type GroupId } from "../lib/groups";
import { ease } from "../lib/motion";
import { Heading } from "./ui";
import { DiffusionTerminal } from "./DiffusionTerminal";
import { QueryPlanViz } from "./viz/QueryPlanViz";
import { RecommenderGate } from "./viz/RecommenderGate";
import { RequestFlowViz } from "./viz/RequestFlowViz";

export type Showcase = {
  eyebrow: string;
  title: string;
  body: string;
  node: React.ReactNode;
  wide?: boolean;
};

/** The interactive demo for each domain, shown on its page and on /visualizations. */
export const SHOWCASES: Partial<Record<GroupId, Showcase>> = {
  systems: {
    eyebrow: "Under the hood",
    title: "From SQL to pages in memory.",
    body: "Run the query to watch the optimizer cost three plans and pick an index nested-loop join. Every page the executor touches then goes through a 4-frame buffer pool managed by ARC, the replacement policy I built for BusTub. Hot customer pages earn a place in T2, revisited heap pages compete through T1, and the target p shifts each time a ghost list proves one side wrong.",
    node: <QueryPlanViz />,
    wide: true,
  },
  ml: {
    eyebrow: "Under the hood",
    title: "Matrix factorization, trained in front of you.",
    body: "A Manim-style walkthrough of collaborative filtering. Sparse ratings are factored into user and item embeddings in ℝ³, trained with SGD on the observed entries only, and each missing rating is predicted as the average rating plus a user·item dot product. The training is real and runs in your browser.",
    node: <RecommenderGate />,
    wide: true,
  },
  web: {
    eyebrow: "Under the hood",
    title: "Follow a request through the stack.",
    body: "The architecture from my Cloud Bookstore CQRS platform. Reads and writes take different paths, writes emit Kafka events, a CronJob keeps the Mongo read model in sync, and recommendations are guarded by a circuit breaker. Take the recs service down and watch the breaker trip, fall back, and recover.",
    node: <RequestFlowViz />,
    wide: true,
  },
  ai: {
    eyebrow: "Try it",
    title: "Ask me something.",
    body: "This answer renders like a masked text diffusion model: every token starts as noise and is refined in parallel over denoising steps, instead of being written left to right one token at a time.",
    node: <DiffusionTerminal />,
  },
};

/** Heading plus demo, laid out wide (stacked) or side by side. */
export function ShowcaseBlock({
  showcase,
  color,
  kicker = showcase.eyebrow,
  footer,
}: {
  showcase: Showcase;
  /** CSS variable holding the accent, e.g. "--systems" */
  color: string;
  kicker?: string;
  /** Extra content under the heading text, e.g. a link */
  footer?: React.ReactNode;
}) {
  const heading = (
    <div>
      <Heading kicker={kicker} color={color} lead={showcase.body}>
        {showcase.title}
      </Heading>
      {footer && <div className="-mt-4 mb-8 md:-mt-5 md:mb-10">{footer}</div>}
    </div>
  );
  const demo = (
    <motion.div
      className="min-w-0"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease }}
    >
      {showcase.node}
    </motion.div>
  );
  return showcase.wide ? (
    <>
      {heading}
      {demo}
    </>
  ) : (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      {heading}
      {demo}
    </div>
  );
}
