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
  /** Technology filters always offered on this group's page, even if only one project uses them */
  filters?: string[];
};

/**
 * Key a technology is filtered by, so versioned variants share one filter
 * (e.g. "C++17" is found by the "C++" filter).
 */
export const techFilterKey = (t: string) => (t.startsWith("C++") ? "C++" : t);

export const GROUPS: GroupMeta[] = [
  {
    id: "systems",
    path: "/systems",
    label: "Systems",
    short: "SYS",
    icon: Cpu,
    cssVar: "--systems",
    hex: ["#ffad33", "#a35200"],
    pinned: [
      // databases
      "bustub",
      // distributed systems on the cloud
      "bookstore-cqrs",
      "devsecops-petclinic",
      // ML systems
      "mpi-parallel-training",
      "gloo-ddp",
      "blackwell-gemm",
      "hardware-aware-compression",
    ],
    filters: ["C++"],
    tagline: "Databases, distributed systems on the cloud, and ML systems.",
    description:
      "Databases first: I built the core of an OLTP database engine in C++ on CMU's BusTub, from a concurrent buffer pool with an ARC replacer to a latch-crabbing B+ tree. Then distributed systems on the cloud, with event-driven CQRS services on Kubernetes and the infrastructure as code behind them. Then ML systems: parallel training engines, collective communication, and GPU kernels measured against cuBLAS.",
  },
  {
    id: "ml",
    path: "/ml",
    label: "Machine Learning",
    short: "ML",
    icon: BrainCircuit,
    cssVar: "--ml",
    hex: ["#ac91ff", "#7319e6"],
    pinned: [
      // large-scale training: autoregressive, then diffusion
      "gpt2-lr-transfer",
      "few-step-image-generation",
      // fine-tuning
      "macreduce",
      "bert-lora-minhash",
      // inference optimization
      "hardware-aware-compression",
    ],
    filters: ["MLX"],
    tagline: "Training at scale, fine-tuning, and fast inference.",
    description:
      "Large-scale training, autoregressive and diffusion: training GPT-2 on AWS and few-step diffusion and flow-matching generators. Fine-tuning with LoRA and federated QLoRA, hyperparameter optimization with muP learning-rate transfer, and inference optimization on both NVIDIA Blackwell and Apple Silicon.",
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
