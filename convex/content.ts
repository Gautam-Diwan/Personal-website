/**
 * Single source of truth for portfolio content.
 *
 * Sourced from the master CV (cv.md) and LaTeX resume sections.
 * Bump CONTENT_VERSION in portfolio.ts after editing so the live
 * Convex deployment reseeds on the next page load.
 *
 * Groups: a project may belong to one or more of
 *   "systems" | "ml" | "ai" | "web"
 */

export type GroupId = "systems" | "ml" | "ai" | "web";

export type Metric = { label: string; value: string };

export type ProjectSeed = {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  context: string;
  groups: GroupId[];
  technologies: string[];
  highlights: string[];
  metrics?: Metric[];
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  sortKey: number; // YYYYMM of start date, used for ordering
  featured: boolean;
  category: "work" | "academic" | "personal" | "open-source";
};

export type ExperienceSeed = {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  summary: string;
  description: string[];
  technologies: string[];
  groups: GroupId[];
  sortKey: number;
  type: "work" | "internship" | "practicum";
};

export const projects: ProjectSeed[] = [
  {
    slug: "gpt2-lr-transfer",
    title: "GPT-2 Training and LR Transfer",
    description:
      "Swept learning rates on narrow proxies, transferred them to a 125M GPT-2 with muP, then pretrained and chat-tuned it on AWS under a hard budget.",
    longDescription:
      "An end-to-end small-LLM training run for CMU 10-805. Learning rates were tuned cheaply on narrow proxy models and transferred to full width with maximal update parametrization (muP), then a 125M-parameter GPT-2 was continued-pretrained on programming and web data and supervised fine-tuned on chat conversations. Cloud runs were automated with spend guards so the whole thing finished well under budget.",
    context: "CMU 10-805 · Machine Learning with Large Datasets",
    groups: ["ml", "systems"],
    technologies: ["PyTorch", "muP", "GPT-2", "AWS EC2", "S3", "Python"],
    highlights: [
      "Ran 18 learning-rate trials across model widths and training horizons; selected a rate at 4.3663 proxy validation loss and transferred it from width 96 to 768 with muP.",
      "Continued pretraining a 125M-parameter GPT-2 on programming and web data to 2.7387 domain validation loss, then fine-tuned on 10,000 chat conversations to 2.0031 SFT validation loss.",
      "Automated AWS EC2 and S3 runs with timing-based spend guards, independent shutdown deadlines, and SHA-256 checkpoint verification.",
    ],
    metrics: [
      { label: "LR trials", value: "18" },
      { label: "Width transfer", value: "96 → 768" },
      { label: "SFT val loss", value: "2.0031" },
      { label: "Spend vs cap", value: "$26.78 / $60" },
    ],
    startDate: "November 2026",
    sortKey: 202611,
    featured: false,
    category: "academic",
  },
  {
    slug: "macreduce",
    title: "MacReduce",
    description:
      "Heterogeneous federated QLoRA across three Apple Silicon Macs, mixing GPU and Neural Engine clients and shipping only LoRA deltas.",
    longDescription:
      "MacReduce explores federated fine-tuning on the hardware people already own. Each Mac runs a resident MLX trainer as a GPU, GPU plus Neural Engine, or split client, and only a small LoRA delta of Qwen3-0.6B-4bit crosses the network while the 4-bit base model stays on device. Rounds are coordinated with Flower over Tailscale.",
    context: "CMU 10-805 · Machine Learning with Large Datasets",
    groups: ["ml", "systems"],
    technologies: ["MLX", "QLoRA", "Qwen3", "Flower", "Tailscale", "Apple Neural Engine", "Python"],
    highlights: [
      "Designed heterogeneous federated QLoRA so each of 3 Macs runs as a GPU, GPU+ANE, or split client, shipping only a 5.05M-parameter LoRA delta of Qwen3-0.6B-4bit.",
      "Cut WikiText-2 test perplexity from 64.2 to 23.3 across 12,288 QLoRA steps by training rank-8 adapters on an M4 GPU with a 1-block ANEForge Neural Engine suffix.",
      "Completed a 3-Mac GPU FedAvg run over Tailscale and Flower in 3 rounds across an M4 Air coordinator, M4 Pro, and 8 GB M1, exchanging 20 MB LoRA deltas.",
    ],
    metrics: [
      { label: "Perplexity", value: "64.2 → 23.3" },
      { label: "LoRA delta", value: "5.05M params" },
      { label: "Clients", value: "3 Macs" },
      { label: "QLoRA steps", value: "12,288" },
    ],
    startDate: "October 2026",
    sortKey: 202610,
    featured: true,
    category: "academic",
  },
  {
    slug: "bert-lora-minhash",
    title: "BERT LoRA and MinHash Dedup",
    description:
      "Parameter-efficient BERT fine-tuning with LoRA, plus near-duplicate removal over 5M Common Crawl documents on a 16-node cluster.",
    longDescription:
      "Two halves of the large-dataset workflow. First, LoRA fine-tuning of BERT-base on SST-5, showing that training 0.54% of the parameters matches full fine-tuning, with a rank sweep to map the tradeoff. Second, MinHash with banded LSH in Polars to deduplicate a 10.9 GiB Common Crawl slice across a cluster of small nodes.",
    context: "CMU 10-805 · Machine Learning with Large Datasets",
    groups: ["ml", "systems"],
    technologies: ["PyTorch", "BERT", "LoRA", "Polars", "MinHash", "LSH", "AWS"],
    highlights: [
      "Fine-tuned BERT-base on SST-5 with query/value LoRA (rank 16), training 593,669 of 110M parameters (0.54%) to 0.505 validation accuracy, matching full fine-tuning (0.501).",
      "Swept LoRA rank at fixed alpha 32: rank 1 reached 0.263, rank 16 reached 0.505, and rank 256 reached 0.534 validation accuracy.",
      "Deduplicated 4,998,441 Common Crawl documents (10.9 GiB) with MinHash and 4-band LSH in Polars, retaining 4,224,499 on 16 m7a.medium nodes after 19 connected-component rounds.",
    ],
    metrics: [
      { label: "Params trained", value: "0.54%" },
      { label: "Val accuracy", value: "0.505" },
      { label: "Docs deduped", value: "5.0M" },
      { label: "Cluster", value: "16 nodes" },
    ],
    startDate: "October 2026",
    endDate: "November 2026",
    sortKey: 202610,
    featured: false,
    category: "academic",
  },
  {
    slug: "atrium",
    title: "Atrium",
    description:
      "Hotel group-rate booking with in-browser voice negotiation that bargains nightly rates while keeping private targets away from the model.",
    longDescription:
      "Built with a 4-person team at HackCMU. Atrium researches hotels, produces quotes, and then negotiates group rates through a realtime voice agent. Disclosure rules enforced with Zod keep the client's private targets and ceilings out of the model's context, and a scroll-pinned cinematic homepage walks from hotel doors to the lobby to the dashboard.",
    context: "HackCMU hackathon · 4-person team",
    groups: ["ai", "web"],
    technologies: ["Next.js 16", "React 19", "xAI Realtime", "WebSocket", "Zod", "Tavily", "Vitest"],
    highlights: [
      "Built a scroll-pinned cinematic homepage (doors to lobby to laptop-zoom dashboard) in Next.js 16 and React 19.",
      "Implemented in-browser Grok Voice negotiation over the xAI Realtime WebSocket (24 kHz PCM) with Zod disclosure rules that keep private targets and ceilings off the model.",
      "Orchestrated research to quote to negotiation for 5 hotels (Querit live search, Tavily fallback), with simulated first-round calls landing 10 to 18% under aggregator rates and 200+ Vitest tests.",
    ],
    metrics: [
      { label: "Under aggregator", value: "10–18%" },
      { label: "Tests", value: "200+" },
      { label: "Hotels", value: "5" },
    ],
    startDate: "September 2026",
    sortKey: 202609,
    featured: false,
    category: "personal",
  },
  {
    slug: "bustub",
    title: "BusTub Storage Engine",
    description:
      "Concurrent buffer pool, ARC replacer, disk scheduler, and a latch-crabbing B+ tree for the CMU-DB BusTub engine, in modern C++.",
    longDescription:
      "Database internals work on the CMU-DB BusTub codebase. The buffer pool manages 8 KB pages with asynchronous dirty writeback and single-flight misses, backed by an 8-worker disk scheduler and an ARC replacement policy with scan resistance and prefetch. The B+ tree uses optimistic latch crabbing so readers and writers rarely block each other.",
    context: "CMU 15-645 · Database Systems",
    groups: ["systems"],
    technologies: ["C++17", "Concurrency", "ARC", "B+ Tree", "CMake"],
    highlights: [
      "Built a concurrent 8 KB buffer pool with async dirty writeback, single-flight misses, RAII page guards, and an 8-worker disk scheduler (same-page FIFO, other pages parallel).",
      "Finished Top 5 on the P1 Gradescope leaderboard: 82.5K scan and 56.9K get QPS at 0 ms I/O.",
      "Implemented Megiddo/Modha ARC (ghost B1/B2, adaptive p) with SIEVE-style scan resistance and AMP prefetch; O(1) RecordAccess cleared the 256K-frame gate in under 3 s.",
      "Implemented a unique-key B+ tree with leaf tombstones, split/borrow/coalesce, and optimistic latch crabbing with no tree-wide mutex; 11th on the P2 leaderboard.",
    ],
    metrics: [
      { label: "P1 leaderboard", value: "Top 5" },
      { label: "Scan QPS", value: "82.5K" },
      { label: "Get QPS", value: "56.9K" },
      { label: "P2 leaderboard", value: "11th" },
    ],
    startDate: "September 2026",
    endDate: "Present",
    sortKey: 202609,
    featured: true,
    category: "academic",
  },
  {
    slug: "gloo-ddp",
    title: "Gloo Packed All-Reduce DDP",
    description:
      "Data-parallel SGD on torch.distributed Gloo with a single packed all-reduce per step, and a study of when sync costs dominate.",
    longDescription:
      "A from-scratch data-parallel trainer that packs all gradients into one buffer per optimizer step. Scaling experiments on 1, 2, and 4 CPU workers show communication overhead dominating a small MLP, and periodic parameter averaging recovering throughput at a measurable accuracy cost.",
    context: "CMU 10-805 · Machine Learning with Large Datasets",
    groups: ["systems", "ml"],
    technologies: ["PyTorch", "torch.distributed", "Gloo", "Python"],
    highlights: [
      "Implemented packed all-reduce data-parallel SGD with rank-0 parameter broadcast and one concatenated all_reduce per optimizer step.",
      "Measured 1, 2, and 4 CPU workers over 30 epochs and showed Gloo synchronization dominating a small 80-feature MLP.",
      "Averaging parameters every 16 steps on 4 workers cut wall time from 8.85 s to 3.52 s and raised throughput to 8.65e5 examples/s.",
    ],
    metrics: [
      { label: "Wall time", value: "8.85s → 3.52s" },
      { label: "Throughput", value: "8.65e5 ex/s" },
      { label: "Workers", value: "1 / 2 / 4" },
    ],
    startDate: "September 2026",
    sortKey: 202609,
    featured: false,
    category: "academic",
  },
  {
    slug: "million-song-mlp",
    title: "Million Song Regression and Popularity MLP",
    description:
      "Polars LazyFrame pipelines for full-batch gradient descent on the Million Song dataset, plus a PyTorch popularity classifier.",
    longDescription:
      "Large-dataset modeling without reaching for a cluster: Polars lazy pipelines for year prediction with feature interactions and regularization, and a PyTorch MLP over TF-IDF plus numeric features streamed from public S3.",
    context: "CMU 10-805 · Machine Learning with Large Datasets",
    groups: ["ml"],
    technologies: ["Polars", "PyTorch", "NumPy", "S3"],
    highlights: [
      "Built Polars LazyFrame pipelines with full-batch gradient descent, L2 tuning, and ordered two-way interactions, reaching held-out test RMSE 16.23.",
      "Trained a PyTorch MLP on TF-IDF plus numeric features loaded from public S3; early-stopped on validation AUROC to reach 0.794 test AUROC.",
    ],
    metrics: [
      { label: "Test RMSE", value: "16.23" },
      { label: "Test AUROC", value: "0.794" },
    ],
    startDate: "September 2026",
    sortKey: 202609,
    featured: false,
    category: "academic",
  },
  {
    slug: "open-notebook",
    title: "Open Notebook: oMLX Provider",
    description:
      "Merged first-class oMLX support for private local inference on Apple Silicon, plus DNS-pinned SSRF hardening, into Open Notebook.",
    longDescription:
      "Open-source contribution to Open Notebook, a multi-provider LLM notebook app. Landed oMLX as a first-class provider, coordinating with the upstream Esperanto provider library, so users can run local LLM and embedding inference on Apple Silicon. Also hardened outbound provider HTTP against SSRF and fixed Docker CI.",
    context: "Open source contribution",
    groups: ["ai", "systems"],
    technologies: ["Python", "oMLX", "MLX", "Esperanto", "Docker", "SSRF hardening"],
    highlights: [
      "Landed first-class oMLX as a provider with upstream Esperanto coordination, enabling private local LLM and embedding inference on Apple Silicon (about +431 LOC, 72 tests).",
      "Hardened outbound provider HTTP with DNS-pinned SSRF protections (resolve once, pin to safe IPs, preserve Host and TLS SNI) across openai-compatible, Ollama, and Azure-style paths.",
      "Fixed Docker CI so builds install git and resolve a git-pinned Esperanto dependency (about +423 LOC, 43 tests).",
    ],
    metrics: [
      { label: "oMLX change", value: "+431 LOC" },
      { label: "SSRF + CI change", value: "+423 LOC" },
      { label: "Status", value: "Merged" },
    ],
    githubUrl: "https://github.com/lfnovo/open-notebook",
    startDate: "July 2026",
    endDate: "Present",
    sortKey: 202607,
    featured: true,
    category: "open-source",
  },
  {
    slug: "research-deck-pipeline",
    title: "Agentic Research and Deck Pipeline",
    description:
      "Six-phase LangGraph research agent with parallel Claude fan-out and an automated deck generator; roughly half the runtime and 40 to 50% lower LLM cost.",
    longDescription:
      "Built at Skilly. A six-phase research pipeline was first prototyped in n8n, then migrated to Python and LangGraph because n8n could not express N-way parallel Claude fan-out. The final phase generates slide decks from a structured DeckSpec with an LLM critic-revise loop. Reliability and cost were treated as first-class: checkpoint resume, circuit breakers, prompt caching, and full observability.",
    context: "Skilly · Industrial project",
    groups: ["ai", "systems"],
    technologies: ["LangGraph", "Python", "Claude", "FastAPI", "SQLite", "Jinja2", "Playwright", "Langfuse", "OpenTelemetry", "Grafana"],
    highlights: [
      "Migrated a six-phase pipeline from n8n to LangGraph for N-way parallel Claude fan-out via the Send API, roughly halving runtime.",
      "Cut LLM cost about 40 to 50% with prompt caching, structured outputs, and Agent Skills injection.",
      "Added SQLite checkpoint resume and FastAPI status-poll and resume endpoints so long runs survive failures.",
      "Built a deck generator (Claude DeckSpec to Jinja2 and Playwright geometry to PPTX) with an LLM critic-revise loop.",
      "Hardened runs with circuit breakers, exponential backoff, and simulation-structured queues, observed through OpenTelemetry, Grafana (Tempo, Loki, Prometheus), and Langfuse.",
    ],
    metrics: [
      { label: "Runtime", value: "~50% lower" },
      { label: "LLM cost", value: "−40–50%" },
      { label: "Cache reads / run", value: "0.3–1.2M tok" },
      { label: "Phases", value: "6" },
    ],
    startDate: "June 2026",
    endDate: "Present",
    sortKey: 202606,
    featured: true,
    category: "work",
  },
  {
    slug: "chat-simulator-studio",
    title: "Chat Simulator Studio",
    description:
      "Two-panel React 19 visual editor with live preview, a serverless Playwright screenshot API, and shareable render links.",
    longDescription:
      "A visual editor for crafting chat-style product demos, built at Skilly. Click-to-edit UX with CSS design tokens and a scaled live-preview iframe, backed by a serverless headless-Chromium screenshot API that fits inside Vercel's function time budget.",
    context: "Skilly · Industrial project",
    groups: ["web"],
    technologies: ["React 19", "TanStack Start", "Tailwind CSS", "Playwright", "OpenAPI 3.0", "Clerk", "Vercel", "AWS Amplify"],
    highlights: [
      "Built a two-panel editor with click-to-edit UX, CSS design tokens, and real-time preview in a scaled iframe.",
      "Implemented a serverless Playwright screenshot API (PNG and ZIP frame export) with headless Chromium inside Vercel's 10 second budget across six OpenAPI 3.0 endpoints.",
      "Added a shareable render-link codec with Clerk bearer auth and an AWS Amplify SSR fallback for dual-cloud deploys.",
    ],
    metrics: [
      { label: "REST endpoints", value: "6" },
      { label: "Render budget", value: "< 10s" },
      { label: "Clouds", value: "2" },
    ],
    startDate: "May 2026",
    endDate: "Present",
    sortKey: 202605,
    featured: false,
    category: "work",
  },
  {
    slug: "devsecops-petclinic",
    title: "DevSecOps Pipeline for Spring Petclinic",
    description:
      "Terraform and Ansible provisioning for a GCP DevSecOps environment with secure Jenkins-to-production deploys.",
    longDescription:
      "A 5-person DevSecOps project. My ownership covered infrastructure as code for the GCP environment that runs Jenkins CI and production, host configuration with Ansible, and a secure, non-interactive deploy path.",
    context: "CMU 17-636 · DevOps · 5-person team",
    groups: ["systems"],
    technologies: ["Terraform", "Ansible", "GCP", "Jenkins", "Docker", "Java 21"],
    highlights: [
      "Wrote Terraform for a 2-VM GCP environment (VPC, subnet, firewall, SSH metadata, spot scheduling) powering Jenkins CI and production.",
      "Bootstrapped hosts with Ansible (Docker, OpenJDK 21, systemd, sysctl) and synced inventory from Terraform outputs to prevent drift.",
      "Secured Jenkins-to-production deploys with managed SSH deploy keys and non-interactive Ansible.",
    ],
    startDate: "April 2026",
    sortKey: 202604,
    featured: false,
    category: "academic",
  },
  {
    slug: "tartan-tickets",
    title: "Tartan Tickets + Scotty Launch Assurance",
    description:
      "Stabilized a TypeScript ticketing stack and built guardrails for an AI refund agent, proven with concurrency and safety tests.",
    longDescription:
      "A ticketing microservice stack taken through deploy, refactor, and AI-launch phases. The Scotty AI refund assistant is wrapped in hard guardrails: ownership checks, idempotent transactions, and abuse throttling, backed by hazard-linked tests and full observability.",
    context: "CMU 17-643 · Quality Management",
    groups: ["web", "ai"],
    technologies: ["TypeScript", "React", "Express", "PostgreSQL", "TypeORM", "Prometheus", "Grafana", "Loki"],
    highlights: [
      "Stabilized a React, Express, PostgreSQL, and TypeORM stack through graduation-scale load tests with no downtime.",
      "Built AI refund guardrails: JWT ownership checks, atomic idempotent transactions, past-event and duplicate denial, admin audit trail, and a 3 requests per 15 minutes throttle.",
      "Wrote 31 refund safety tests with 0 failures and proved exactly one success under parallel refund attempts.",
    ],
    metrics: [
      { label: "Safety tests", value: "31 / 0 fail" },
      { label: "Parallel refunds", value: "Exactly 1" },
    ],
    startDate: "March 2026",
    endDate: "May 2026",
    sortKey: 202603,
    featured: false,
    category: "academic",
  },
  {
    slug: "hardware-aware-compression",
    title: "Hardware-Aware Model Compression",
    description:
      "Roofline profiling of W4A8 quantization, INT8 KV cache, and structural pruning on Qwen3-8B running on NVIDIA B200 GPUs.",
    longDescription:
      "LLM inference is memory- and bandwidth-bound, and compression changes where the bottleneck sits on the roofline. This research-style project in Prof. Tianqi Chen's ML Systems course characterizes quantization, KV-cache quantization, and pruning on Blackwell hardware, alone and combined.",
    context: "CMU 15-642 · ML Systems",
    groups: ["ml", "systems"],
    technologies: ["PyTorch", "CUDA", "Modal", "NVIDIA B200", "Qwen3-8B", "Quantization"],
    highlights: [
      "Ran roofline-style profiling on Modal with NVIDIA B200 GPUs.",
      "Characterized W4A8 weight and activation quantization, INT8 KV-cache quantization, and structural pruning on Qwen3-8B.",
      "Evaluated combined techniques to minimize inference time while maximizing memory-bandwidth utilization.",
    ],
    startDate: "March 2026",
    endDate: "May 2026",
    sortKey: 202603,
    featured: false,
    category: "academic",
  },
  {
    slug: "blackwell-gemm",
    title: "Blackwell FP16 GEMM Kernel",
    description:
      "An FP16 GEMM for NVIDIA B200 built from scratch across ten optimization stages, targeting cuBLAS-level throughput.",
    longDescription:
      "GEMM dominates LLM training and inference, and beating vendor libraries means thinking in memory movement, warp roles, and pipeline depth. Written with Apache TVM TIRX, the kernel was built stage by stage and measured after every change, ending with 2-CTA clusters and warp-specialized producers and consumers on Blackwell.",
    context: "CMU 15-642 · ML Systems",
    groups: ["systems", "ml"],
    technologies: ["CUDA", "Apache TVM TIRX", "C++", "NVIDIA Blackwell", "TMA", "tcgen05"],
    highlights: [
      "Built the kernel across ten stages: K-loop accumulation, TMA async loads, software pipelining, persistent scheduling, warp specialization, and 2-CTA clustering.",
      "Used Blackwell TMEM, TMA, tcgen05 MMA, and hardware mbarriers with 4-stage pipelining.",
      "Scheduled 512x256 tiles with L2-aware persistent scheduling across 148 SMs, using 3 warpgroups (TMA producer, MMA consumers, writeback) to overlap data movement with compute.",
    ],
    metrics: [
      { label: "Opt. stages", value: "10" },
      { label: "SMs", value: "148" },
      { label: "Tile", value: "512×256" },
      { label: "Pipeline", value: "4-stage" },
    ],
    startDate: "March 2026",
    endDate: "April 2026",
    sortKey: 202603,
    featured: true,
    category: "academic",
  },
  {
    slug: "bookstore-cqrs",
    title: "Cloud Bookstore CQRS Platform",
    description:
      "A monolith split into CQRS command and query services on a 7-service EKS stack with Terraform, Kafka, and circuit breakers.",
    longDescription:
      "Decomposed a monolithic book service into separate command and query paths, with a MongoDB read model kept fresh by a Kubernetes CronJob ETL, a backend-for-frontend router, and resilient recommendation calls.",
    context: "CMU 17-647 · Engineering Data Intensive Scalable Systems",
    groups: ["systems", "web"],
    technologies: ["FastAPI", "MongoDB", "Kubernetes", "EKS", "Terraform", "Kafka", "AWS RDS"],
    highlights: [
      "Split the service into FastAPI command and query services with a MongoDB read model and BFF path-based routing.",
      "Ran an RDS to MongoDB ETL as a Kubernetes CronJob every 60 seconds (upsert, concurrency-forbid).",
      "Provisioned a 7-service EKS stack with Terraform, Kafka CRM events, a recommendation circuit breaker (3 s timeout, 60 s open window), and 17 integration tests.",
    ],
    metrics: [
      { label: "Services", value: "7" },
      { label: "ETL interval", value: "60s" },
      { label: "Integration tests", value: "17" },
    ],
    startDate: "March 2026",
    endDate: "April 2026",
    sortKey: 202603,
    featured: false,
    category: "academic",
  },
  {
    slug: "mpi-parallel-training",
    title: "MPI 2D Parallel Training Engine",
    description:
      "Data and tensor parallelism plus ZeRO-3 style sharding implemented from scratch with MPI collectives.",
    longDescription:
      "The ideas behind Megatron and ZeRO, implemented without a framework. Data parallelism and tensor model parallelism over MPI collectives on 8 processes, with correct forward and backward communication and a sharded optimizer.",
    context: "CMU 15-642 · ML Systems",
    groups: ["systems", "ml"],
    technologies: ["Python", "NumPy", "MPI", "mpi4py"],
    highlights: [
      "Implemented data parallelism and tensor model parallelism with Allgather, Allreduce, and Reduce-Scatter across 8 processes using split communicators.",
      "Built naive and Megatron-style FC weight sharding with correct forward and backward communication.",
      "Implemented a ZeRO-DP Stage 3 style layer: shard-local parameters, all-gather for compute, reduce-scatter for gradients, and shard-local Adam.",
    ],
    metrics: [
      { label: "MNIST, 1 epoch", value: "90.5%" },
      { label: "Processes", value: "8" },
      { label: "ZeRO", value: "Stage 3" },
    ],
    githubUrl: "https://github.com/Gautam-Diwan/assignment-distributed-training",
    startDate: "February 2026",
    endDate: "March 2026",
    sortKey: 202602,
    featured: false,
    category: "academic",
  },
  {
    slug: "personal-portfolio",
    title: "This Portfolio",
    description:
      "React 19, TanStack Router, and Convex with a three.js hero and Framer Motion transitions; content seeded from a typed source of truth.",
    longDescription:
      "The site you are looking at. Content lives in a typed Convex seed so every page, group route, and project page reads from one source. The hero is a three.js point field that morphs per domain, and Framer Motion handles layout and route transitions.",
    context: "Personal project",
    groups: ["web"],
    technologies: ["React 19", "TanStack Router", "Convex", "three.js", "Framer Motion", "Tailwind CSS"],
    highlights: [
      "Built a real-time content backend on Convex with an auto-seeding, versioned content pipeline and a blog CMS.",
      "Designed a three.js hero whose particle field morphs into a different shape for each domain.",
      "Added Framer Motion layout animations, shared-element nav, and reduced-motion support.",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Personal-website",
    liveUrl: "https://gautamdiwan.com",
    startDate: "February 2026",
    endDate: "Present",
    sortKey: 202602,
    featured: false,
    category: "personal",
  },
  {
    slug: "few-step-image-generation",
    title: "Few-Step Image Generation",
    description:
      "Flow matching, DPM-Solver, and progressive distillation cut sampling from 320 to 40 steps and 8x faster, while improving FID.",
    longDescription:
      "High-quality image generators need many network evaluations, which makes sampling slow. This PyTorch stack combines flow matching, a fast ODE solver, and progressive distillation into a compact student, then squeezes the runtime with mixed precision and torch.compile. Presented as an ICML-style poster; the course grade was A+.",
    context: "CMU 10-799 · Diffusion and Flow Matching · A+",
    groups: ["ml"],
    technologies: ["PyTorch", "Flow Matching", "DPM-Solver", "Distillation", "torch.compile"],
    highlights: [
      "Combined flow matching, DPM-Solver, and progressive distillation with Huber loss, anchor distillation, and a compact student.",
      "Cut NFE from 320 to 40 and time for 1k samples from 51.68 s to 6.47 s on CelebA-64 with an NVIDIA L40S.",
      "Improved quality at the same time: FID 26.35 to 22.61 and KID 0.00945 to 0.00701.",
    ],
    metrics: [
      { label: "NFE", value: "320 → 40" },
      { label: "1k samples", value: "51.7s → 6.5s" },
      { label: "FID", value: "26.35 → 22.61" },
      { label: "Grade", value: "A+" },
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Diffusion-and-Flow-Matching",
    startDate: "January 2026",
    endDate: "February 2026",
    sortKey: 202601,
    featured: true,
    category: "academic",
  },
  {
    slug: "globetrotter",
    title: "Globetrotter",
    description:
      "A full-stack travel quiz with cryptic clues, scoring, and WhatsApp challenge invites, deployed serverless on Vercel.",
    longDescription:
      "Guess famous destinations from cryptic clues. Randomized destinations and multiple-choice APIs, score tracking, challenge invites over WhatsApp, and confetti for the wins.",
    context: "Personal project",
    groups: ["web"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Postgres", "Prisma", "Vercel"],
    highlights: [
      "Built randomized destination and multiple-choice APIs on Supabase Postgres with Prisma.",
      "Added scoring, WhatsApp challenge invites, and canvas-confetti feedback.",
      "Deployed on Vercel serverless.",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Globetrotter",
    startDate: "March 2025",
    endDate: "April 2025",
    sortKey: 202503,
    featured: false,
    category: "personal",
  },
  {
    slug: "go-djan",
    title: "Go Djan",
    description:
      "A Go web service for blogs, tags, users, and friendships with Paseto auth and Ent ORM on Postgres.",
    longDescription:
      "A Django-inspired backend in Go. CRUD for blogs, tags, users, and friendships, Bcrypt and Paseto authentication, and Postgres through Ent ORM, using Go concurrency for high-throughput request handling.",
    context: "Personal project",
    groups: ["web", "systems"],
    technologies: ["Go", "Postgres", "Ent ORM", "Paseto", "Bcrypt"],
    highlights: [
      "Built CRUD APIs for blogs, tags, users, and friendships.",
      "Implemented Bcrypt and Paseto authentication.",
      "Used Ent ORM over Postgres with Go concurrency for high-throughput request handling.",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Go-Djan",
    startDate: "August 2024",
    endDate: "September 2024",
    sortKey: 202408,
    featured: false,
    category: "personal",
  },
  {
    slug: "deleterious",
    title: "Deleterious",
    description:
      "An open-source Django REST Framework mixin for efficient batch deletion, published on PyPI.",
    longDescription:
      "A small, focused library: a DRF mixin that enables batch deletion through a single DELETE-style API, with customizable endpoints and queries. Published on PyPI under the MIT License.",
    context: "Open source · PyPI",
    groups: ["web"],
    technologies: ["Python", "Django", "Django REST Framework", "PyPI"],
    highlights: [
      "Designed a DRF mixin for batch deletion through one DELETE-style API with customizable endpoints and queries.",
      "Published on PyPI and GitHub under the MIT License.",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/drf-deleterious",
    startDate: "June 2024",
    endDate: "July 2024",
    sortKey: 202406,
    featured: false,
    category: "open-source",
  },
  {
    slug: "hirezen",
    title: "Hirezen",
    description:
      "MERN marketplace connecting Tier-3 Indian cities with local service providers, ranked by a BERT review pipeline.",
    longDescription:
      "Undergraduate capstone. A MERN platform for booking local service providers, with a PyTorch BERT pipeline over user reviews and Kolmogorov-Smirnov sampling-test scoring to rank providers.",
    context: "TIET capstone",
    groups: ["ml", "web"],
    technologies: ["PyTorch", "BERT", "MongoDB", "Express", "React", "Node.js"],
    highlights: [
      "Designed a PyTorch BERT pipeline over user reviews with Kolmogorov-Smirnov sampling-test scoring.",
      "Built booking workflow CRUD APIs in Node.js, Express, and MongoDB.",
    ],
    githubUrl: "https://github.com/YashKumar-0307/Hirezen",
    startDate: "April 2022",
    endDate: "December 2022",
    sortKey: 202204,
    featured: false,
    category: "academic",
  },
  {
    slug: "face-fusion",
    title: "Face Fusion",
    description:
      "A DCGAN built from scratch in PyTorch to synthesize anime-style faces.",
    longDescription:
      "A complete generative computer vision pipeline: preprocessing, a DCGAN architecture written from scratch, hyperparameter tuning, training, collage generation, and evaluation.",
    context: "Personal project",
    groups: ["ml"],
    technologies: ["PyTorch", "DCGAN", "Computer Vision"],
    highlights: [
      "Built a DCGAN generator and discriminator from scratch in PyTorch.",
      "Ran the full pipeline: preprocessing, tuning, training, collage generation, and evaluation.",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Face-Fusion",
    startDate: "May 2022",
    endDate: "June 2022",
    sortKey: 202205,
    featured: false,
    category: "personal",
  },
  {
    slug: "ourooms",
    title: "OuRooms",
    description:
      "Ephemeral real-time multi-room chat designed around privacy and zero data retention.",
    longDescription:
      "A privacy-first chat app where nothing is stored. Multi-room real-time messaging over Socket.io with profanity filtering, location sharing, and embedded video playback.",
    context: "TIET group project",
    groups: ["web"],
    technologies: ["React", "Node.js", "Express", "Socket.io"],
    highlights: [
      "Built ephemeral multi-room chat over Socket.io with no data retention.",
      "Added profanity filtering, Geolocation API location sharing, and embedded video playback.",
    ],
    startDate: "September 2021",
    endDate: "December 2021",
    sortKey: 202109,
    featured: false,
    category: "academic",
  },
];

export const experiences: ExperienceSeed[] = [
  {
    company: "RedZone Robotics",
    position: "Software Developer · Carnegie Mellon practicum (Master of Software Engineering – Scalable Systems)",
    location: "Pittsburgh, PA",
    startDate: "August 2026",
    endDate: "December 2026",
    summary:
      "Building a Python video pipeline that turns robot-captured 360° sewer inspection footage into interactive spherical MP4s with burned-in overlays and defect-directed views. In progress.",
    description: [
      "Developing the core renderer that synchronizes overlay frames and source video with the edit decision list, pans and tilts to recorded defects, and encodes spherical MP4s with PyAV and FFmpeg.",
      "Prototyped an Apple Silicon path with a Metal projection kernel and VideoToolbox decode and encode: 95.0 s end to end versus 1,067.7 s for the CPU and x265 baseline on an 8192×4096, 1,599-frame inspection.",
      "The team's NVIDIA renderer uses a CUDA kernel and NVENC, rendering 5,262 frames at 4096×2048 in 140.3 s on an RTX 3080.",
    ],
    technologies: ["Python", "PyAV", "FFmpeg", "Metal", "VideoToolbox", "CUDA", "NVENC"],
    groups: ["systems"],
    sortKey: 202608,
    type: "practicum",
  },
  {
    company: "Skilly (Skillbuilder.io)",
    position: "Go To Market AI/ML Engineer Intern",
    location: "Pittsburgh, PA",
    startDate: "May 2026",
    endDate: "August 2026",
    summary:
      "Agentic LLM systems for research automation, deck generation, and large structured datasets, plus GTM outreach engineering.",
    description: [
      "Migrated a six-phase research agent from n8n to LangGraph for N-way parallel Claude fan-out, roughly halving runtime; prompt caching, structured outputs, and Agent Skills cut LLM cost about 40 to 50%.",
      "Hardened long runs with SQLite checkpoint resume, circuit breakers, exponential backoff, and simulation-structured queues behind FastAPI status and resume endpoints.",
      "Built data lookup agents over IPEDS, College Scorecard, NCSES HERD, and BLS (QCEW about 2.2 GB) on DuckDB with zero in-memory fallback.",
      "Deployed a 7-service observability stack: OpenTelemetry, Grafana Tempo, Prometheus, Loki, and Langfuse.",
      "Ran 500+ personalized outreaches across 5+ email and LinkedIn campaigns with Clay, Claygents, and Claude enrichment, leading to a potential $75k+ in additional MQL-stage revenue.",
    ],
    technologies: ["LangGraph", "Claude", "FastAPI", "DuckDB", "OpenTelemetry", "Langfuse", "React 19", "Playwright"],
    groups: ["ai", "systems", "web"],
    sortKey: 202605,
    type: "internship",
  },
  {
    company: "HCode Technologies",
    position: "Associate Software Engineer",
    location: "Karnal, India",
    startDate: "March 2024",
    endDate: "February 2025",
    summary:
      "LLM and RAG products, payments, and cloud microservices across B2B SaaS and Web3 clients.",
    description: [
      "Built B2B SaaS medical AI RAG bots for US phone hotlines on AWS Lambda, OpenAI, Postgres, Node.js, and Twilio, with sensitive-data anonymization and dynamic allocation of 100+ client numbers.",
      "Developed the hotline operations dashboard (React, TanStack Query, Fastify, Sequelize) with an AI playground, model selection, and dynamic per-client prompts.",
      "Led a Web3 site migration from an MVC monolith to Dockerized microservices on AWS ECS with GitHub Actions CI/CD for spike traffic.",
      "Architected Stripe subscription billing for an NFT marketplace with 3,000+ users: webhooks, adjustable cycles, automated chargebacks, and SES receipts.",
      "Engineered real-time private-equity workflows with LangChain RAG and SQL agents over Django, WebSockets, Redis, and Kafka.",
    ],
    technologies: ["Node.js", "OpenAI", "AWS", "Twilio", "Stripe", "React", "Django", "Kafka", "LangChain"],
    groups: ["ai", "web", "systems"],
    sortKey: 202403,
    type: "work",
  },
  {
    company: "KDataScience Solutions",
    position: "Software Developer",
    location: "Gurugram, India (Remote)",
    startDate: "August 2023",
    endDate: "February 2024",
    summary:
      "Product engineering on a Jira-alternative project management suite for web and desktop.",
    description: [
      "Led migration from server-side MVC rendering to a hybrid client-side architecture, making the product roughly 100% faster with a more app-like UX.",
      "Introduced project-level notebooks with OpenAI GPT integration for in-context collaboration.",
      "Added WebRTC video and screen sharing, recording, seen receipts, and minimized UI modes.",
    ],
    technologies: ["JavaScript", "WebRTC", "OpenAI", "MVC"],
    groups: ["web", "ai"],
    sortKey: 202308,
    type: "work",
  },
  {
    company: "NIIT Learning Systems",
    position: "Associate Software Engineer Intern",
    location: "Gurugram, India (Remote)",
    startDate: "January 2023",
    endDate: "July 2023",
    summary: "High-scale web delivery and portal performance engineering.",
    description: [
      "As sole developer, shipped internal web pages serving 500,000+ users with sub-100 ms responses.",
      "Built and load-tested college application portals on Java, JBoss, and SQL Server, optimizing APIs with Varnish and GTMetrix.",
    ],
    technologies: ["HTML", "CSS", "Bootstrap", "Java", "JBoss", "SQL Server", "Varnish"],
    groups: ["web"],
    sortKey: 202301,
    type: "internship",
  },
];

export const skills: { category: string; items: string[] }[] = [
  {
    category: "Languages",
    items: ["Python", "C++", "C", "CUDA", "Go", "TypeScript", "JavaScript", "Java"],
  },
  {
    category: "ML Systems",
    items: ["PyTorch", "Apache TVM", "Triton", "MLX", "vLLM", "llama.cpp", "MPI", "Quantization", "Roofline analysis"],
  },
  {
    category: "AI & Agents",
    items: ["LangGraph", "LangChain", "Claude API", "OpenAI API", "RAG", "Prompt caching", "Structured outputs", "MCP", "Langfuse"],
  },
  {
    category: "Backend & Data",
    items: ["FastAPI", "Node.js", "Django", "Postgres", "MongoDB", "Redis", "Kafka", "DuckDB", "Polars"],
  },
  {
    category: "Frontend",
    items: ["React 19", "TanStack", "Next.js", "Tailwind CSS", "three.js", "Playwright", "Convex"],
  },
  {
    category: "Cloud & Infra",
    items: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible", "GitHub Actions", "OpenTelemetry", "Grafana"],
  },
];
