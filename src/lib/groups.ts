import {
  Cpu,
  BrainCircuit,
  Sparkles,
  Globe,
  type LucideIcon,
} from "lucide-react";

export type GroupId = "systems" | "ml" | "ai" | "web";
export type SceneShape = "home" | GroupId;

export type GroupMeta = {
  id: GroupId;
  path: `/${GroupId}`;
  label: string;
  short: string;
  icon: LucideIcon;
  /** CSS variable name holding the RGB channels for this group's accent */
  cssVar: `--${GroupId}`;
  /** Hex used by the three.js scene: [dark theme, light theme] */
  hex: [string, string];
  tagline: string;
  description: string;
  /** Project slugs always listed first on this group's page, in this order */
  pinned?: string[];
};

export const GROUPS: GroupMeta[] = [
  {
    id: "systems",
    path: "/systems",
    label: "Systems",
    short: "SYS",
    icon: Cpu,
    cssVar: "--systems",
    hex: ["#ffad33", "#a35200"],
    pinned: ["bustub"],
    tagline: "Backends, storage engines, infrastructure, and kernels.",
    description:
      "Performance from first principles: GPU kernels measured against cuBLAS, concurrent database internals, collective communication for distributed training, and the cloud infrastructure that keeps it all running.",
  },
  {
    id: "ml",
    path: "/ml",
    label: "Machine Learning",
    short: "ML",
    icon: BrainCircuit,
    cssVar: "--ml",
    hex: ["#ac91ff", "#7319e6"],
    tagline: "Training, fine-tuning, and making models fast.",
    description:
      "Models end to end: few-step diffusion, federated QLoRA on Apple Silicon, muP learning-rate transfer, quantization and pruning on Blackwell, and the data pipelines that feed them.",
  },
  {
    id: "ai",
    path: "/ai",
    label: "Artificial Intelligence",
    short: "AI",
    icon: Sparkles,
    cssVar: "--ai",
    hex: ["#ff66aa", "#d6006f"],
    tagline: "Agents and LLM products that hold up in production.",
    description:
      "LLM systems built like systems: parallel agent graphs with checkpoint resume, cost-aware prompt caching, guardrails, voice agents, and local inference providers merged upstream.",
  },
  {
    id: "web",
    path: "/web",
    label: "Web",
    short: "WEB",
    icon: Globe,
    cssVar: "--web",
    hex: ["#3de0a3", "#008055"],
    tagline: "Products people use and pay for: full-stack, APIs, payments.",
    description:
      "Product engineering across the stack: subscription billing, operator dashboards for B2B SaaS, React editors with serverless rendering, microservice platforms, real-time chat, open-source Django tooling, and this site.",
  },
];

export const GROUP_BY_ID = Object.fromEntries(
  GROUPS.map((g) => [g.id, g]),
) as Record<GroupId, GroupMeta>;

export const groupColor = (id: GroupId, alpha = 1) =>
  `rgb(var(--${id}) / ${alpha})`;

export const isGroupId = (s: string): s is GroupId => s in GROUP_BY_ID;
