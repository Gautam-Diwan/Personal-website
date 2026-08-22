import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

export const CONTENT_VERSION = 2;

export const getProjects = query({
  args: {
    featured: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.featured !== undefined) {
      return await ctx.db
        .query("projects")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .order("desc")
        .collect();
    } else if (args.category) {
      return await ctx.db
        .query("projects")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("projects").order("desc").collect();
  },
});

export const getExperiences = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("experiences").order("desc").collect();
  },
});

export const getSkills = query({
  args: {
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.featured !== undefined) {
      return await ctx.db
        .query("skills")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .collect();
    }

    return await ctx.db.query("skills").collect();
  },
});

async function clearPortfolioTables(ctx: MutationCtx) {
  const [projects, experiences, skills] = await Promise.all([
    ctx.db.query("projects").collect(),
    ctx.db.query("experiences").collect(),
    ctx.db.query("skills").collect(),
  ]);
  for (const row of projects) {
    await ctx.db.delete(row._id);
  }
  for (const row of experiences) {
    await ctx.db.delete(row._id);
  }
  for (const row of skills) {
    await ctx.db.delete(row._id);
  }
}

async function insertPortfolioData(ctx: MutationCtx) {
  await ctx.db.insert("projects", {
    title: "Open Notebook",
    description:
      "Merged first-class oMLX support and SSRF hardening into the Open Notebook multi-provider LLM app.",
    longDescription:
      "Landed first-class oMLX as a provider in Open Notebook through Esperanto upstream coordination, so users can run private local LLM and embedding inference on Apple Silicon via MLX (about +431 LOC and 72 tests). Hardened outbound provider HTTP with DNS-pinned SSRF protections for openai-compatible, Ollama, and Azure-style discovery paths, and fixed Docker CI so builds can install git for a git-pinned Esperanto dependency (about +423 LOC and 43 tests).",
    technologies: [
      "oMLX",
      "MLX",
      "Esperanto",
      "Python",
      "SSRF hardening",
      "Docker",
    ],
    githubUrl: "https://github.com/lfnovo/open-notebook",
    featured: true,
    startDate: "July 2026",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "Higher Ed Research & Deck Generation Pipeline",
    description:
      "Six-phase LangGraph research and deck pipeline that cut runtime and LLM cost versus the n8n baseline.",
    longDescription:
      "Built a six-phase research pipeline from scratch in n8n, then migrated it to Python and LangGraph for N-way parallel Claude fan-out (Send API) that n8n could not support, roughly halving runtime, with SQLite checkpoint resume and FastAPI status-poll/resume. Built a deck generator (Claude DeckSpec to Jinja2/Playwright geometry to PPTX) with an LLM critic-revise loop. Prompt caching, structured outputs, and Agent Skills injection cut LLM cost about 40-50%. Hardened runs with circuit breakers, exponential backoff, and simulation-structured queues, plus OpenTelemetry to Grafana (Tempo/Loki/Prometheus) and Langfuse on a Dockerized multi-service stack.",
    technologies: [
      "LangGraph",
      "Python",
      "Claude",
      "FastAPI",
      "Jinja2",
      "Playwright",
      "Langfuse",
      "OpenTelemetry",
    ],
    featured: true,
    startDate: "June 2026",
    category: "work",
  });

  await ctx.db.insert("projects", {
    title: "Chat Simulator Studio",
    description:
      "Two-panel React 19 visual editor with a serverless Playwright screenshot API and shareable render links.",
    longDescription:
      "Built a two-panel visual editor in React 19, TanStack Start, and Tailwind with click-to-edit UX, CSS design tokens, and real-time live preview in a scaled iframe. Implemented a serverless Playwright screenshot API (PNG and ZIP frame export) with headless Chromium inside Vercel's 10 second function budget across six OpenAPI 3.0 REST endpoints. Added a shareable render-link codec with Clerk bearer auth and an AWS Amplify SSR fallback for dual-cloud deploy.",
    technologies: [
      "React 19",
      "TanStack Start",
      "Tailwind CSS",
      "Playwright",
      "OpenAPI 3.0",
      "Clerk",
      "Vercel",
      "AWS Amplify",
    ],
    featured: true,
    startDate: "May 2026",
    category: "work",
  });

  await ctx.db.insert("projects", {
    title: "DevSecOps Pipeline for Spring Petclinic",
    description:
      "Terraform and Ansible ownership for a two-VM GCP Jenkins CI and production DevSecOps environment.",
    longDescription:
      "In a five-member team, owned Terraform provisioning for a two-VM GCP DevSecOps stack (VPC, subnet, firewall, SSH metadata, spot scheduling) powering Jenkins CI and production. Led Ansible host bootstrap (Docker, OpenJDK 21, systemd units, sysctl) and Terraform-output inventory sync to prevent cloud/config drift. Engineered a secure Jenkins-to-production deploy flow with managed SSH deploy keys and non-interactive Ansible execution.",
    technologies: [
      "Terraform",
      "Ansible",
      "GCP",
      "Jenkins",
      "Docker",
      "OpenJDK 21",
    ],
    featured: false,
    startDate: "April 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Tartan Tickets + Scotty Launch Assurance",
    description:
      "Stabilized a TypeScript ticketing stack and shipped Scotty AI refund guardrails with zero downtime under load.",
    longDescription:
      "Stabilized a TypeScript ticketing microservice stack (React, Express, PostgreSQL, TypeORM) across deploy, refactor, and AI-launch phases, including graduation-scale load tests with no downtime. Built Scotty AI refund guardrails with JWT ownership checks, atomic idempotent transactions, past-event and duplicate denial, an admin audit trail, and a 3-per-15-minute per-email abuse throttle. Launch assurance used hazard-linked tests and Prometheus/Grafana/Loki. Result: 31 refund safety tests with 0 failures, and concurrency validation showing exactly one successful refund under parallel attempts.",
    technologies: [
      "TypeScript",
      "React",
      "Express",
      "PostgreSQL",
      "TypeORM",
      "Prometheus",
      "Grafana",
      "Loki",
    ],
    featured: false,
    startDate: "March 2026",
    endDate: "May 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Hardware-Aware Model Compression Profiling",
    description:
      "Roofline profiling of quantization and pruning on Qwen3-8B inference using NVIDIA B200 GPUs.",
    longDescription:
      "Implementing roofline-style profiling on Modal with NVIDIA B200 GPUs to characterize how W4A8 weight/activation quantization, INT8 KV cache quantization, and structural pruning shift bottlenecks in Qwen3-8B inference. Evaluating combined compression techniques to minimize inference time while maximizing memory-bandwidth utilization. Documenting findings for an MLSys-style publication and poster under Tianqi Chen.",
    technologies: [
      "Modal",
      "NVIDIA B200",
      "Qwen3-8B",
      "Quantization",
      "Pruning",
      "Roofline analysis",
    ],
    featured: true,
    startDate: "March 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Blackwell Optimized FP16 GEMM Kernel From Scratch",
    description:
      "Production-structured FP16 GEMM kernel for NVIDIA B200 GPUs across ten TVM TIRX optimization stages.",
    longDescription:
      "Built a production-structured FP16 GEMM kernel for NVIDIA B200 (Blackwell) GPUs in Apache TVM TIRX across ten optimization stages: K-loop accumulation, TMA async loads, software pipelining, persistent scheduling, warp specialization, and 2-CTA clustering. Used Blackwell features (TMEM, TMA, tcgen05 MMA, hardware mbarriers) with 4-stage pipelining and L2-aware persistent tile scheduling across 148 SMs. Final structure: 2-CTA clusters, 3 warpgroups (TMA producer, MMA consumers, writeback), 512x256 tiles, targeting cuBLAS-level TFLOP/s for LLM-critical GEMM.",
    technologies: [
      "Apache TVM",
      "TIRX",
      "CUDA",
      "NVIDIA B200",
      "GEMM",
      "C++",
    ],
    featured: true,
    startDate: "March 2026",
    endDate: "April 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Cloud Bookstore CQRS Platform",
    description:
      "FastAPI CQRS bookstore on EKS with Terraform, Kafka, MongoDB search, and a Kubernetes ETL CronJob.",
    longDescription:
      "Decomposed a monolithic book service into a FastAPI CQRS command/query pair with a MongoDB read model and keyword search that enforces strict 200/204/400 contract behavior, routed through a BFF. Built RDS-to-MongoDB ETL as a Kubernetes CronJob every 60 seconds with upsert semantics and a concurrency-forbid policy, and provisioned a 7-service EKS stack with Terraform and runtime secret injection. Hardened flows with Kafka CRM activation events, a recommendation circuit breaker (3s timeout, 60s open window), and 17 pytest integration cases.",
    technologies: [
      "FastAPI",
      "CQRS",
      "MongoDB",
      "Kubernetes",
      "EKS",
      "Terraform",
      "Kafka",
      "pytest",
    ],
    featured: false,
    startDate: "March 2026",
    endDate: "April 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "MPI-Based 2D Parallel Training Engine From Scratch",
    description:
      "Data-parallel and tensor-parallel training primitives in NumPy/MPI, including ZeRO Stage 3, at 90.5% MNIST accuracy.",
    longDescription:
      "Implemented data-parallel and tensor model-parallel training primitives using MPI collectives (Allgather, Allreduce, Reduce-Scatter) in Python/NumPy across 8 processes with MP-major rank grouping and split communicators. Built naive and Megatron-style FC weight sharding with correct forward and backward communication. Engineered a ZeRO-DP Stage 3 FC layer with shard-local parameters, all-gather for compute, reduce-scatter for gradients, and shard-local Adam, reaching 90.5% MNIST test accuracy in 1 epoch with 4 data-parallel ranks.",
    technologies: ["Python", "NumPy", "MPI", "ZeRO", "Megatron-style TP"],
    githubUrl: "https://github.com/Gautam-Diwan/assignment-distributed-training",
    featured: false,
    startDate: "February 2026",
    endDate: "March 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Personal Portfolio Website",
    description:
      "Full-stack portfolio and blog CMS with Convex real-time sync, dark mode, and admin-gated posts.",
    longDescription:
      "Built a full-stack portfolio and blog CMS (React 19, TanStack Router, Convex serverless BaaS) with real-time data sync, dark mode, paginated full-text search, and admin-gated post management behind password auth. Designed a Convex schema with search-indexed blog content, auth-protected mutations, and auto-seed bootstrapping.",
    technologies: [
      "React 19",
      "TanStack Router",
      "Convex",
      "TypeScript",
      "Tailwind CSS",
    ],
    liveUrl: "https://gautamdiwan.com",
    githubUrl: "https://github.com/Gautam-Diwan/Personal-website",
    featured: false,
    startDate: "February 2026",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "Few Step Image Generation",
    description:
      "Flow Matching plus distillation stack that cut CelebA-64 sampling from 51.68s to 6.47s per 1k images.",
    longDescription:
      "Implemented a PyTorch speed-optimization stack for image generators combining Flow Matching, DPM-Solver, and Progressive Distillation with Huber loss, anchor distillation, and compact student architectures. On CelebA-64 with an NVIDIA L40S (mixed precision, channels-last, torch.compile): NFE 320 to 40, 51.68s to 6.47s for 1k samples, FID 26.35 to 22.61, KID 0.00945 to 0.00701. Presented an ICML-style poster for the speed track and earned an A+ in CMU 10-799.",
    technologies: [
      "PyTorch",
      "Flow Matching",
      "DPM-Solver",
      "Progressive Distillation",
      "CelebA-64",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Diffusion-and-Flow-Matching",
    featured: true,
    startDate: "January 2026",
    endDate: "February 2026",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Globetrotter",
    description: "Full-stack travel quiz platform for famous destinations",
    longDescription:
      "Developed a full-stack travel quiz platform for famous destinations using Next.js, TypeScript, Tailwind CSS, Supabase, Postgres, and Prisma ORM, featuring cryptic clue gameplay, score tracking, and challenge invites via WhatsApp. Implemented randomized destination selection, multiple choice APIs, and animated feedback with canvas-confetti, deployed on Vercel with serverless functions for zero cost, scalable performance.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Supabase",
      "Postgres",
      "Prisma",
      "Vercel",
    ],
    githubUrl: "https://github.com/Gautam-Diwan/Globetrotter",
    featured: false,
    startDate: "March 2025",
    endDate: "April 2025",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "Go Djan",
    description:
      "Web service providing CRUD APIs for blogs, tags, users, and friendships",
    longDescription:
      "Built a web service providing CRUD APIs for blogs, tags, users, and friendships, with Bcrypt and Paseto authentication for better security over JWT. Integrated Postgres with Ent ORM for data persistence, leveraging Go's concurrency model to deliver scalable, high performance requests with minimal resource utilization.",
    technologies: ["Go", "Postgres", "Ent ORM", "Bcrypt", "Paseto"],
    githubUrl: "https://github.com/Gautam-Diwan/Go-Djan",
    featured: false,
    startDate: "August 2024",
    endDate: "September 2024",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "Deleterious",
    description:
      "Open source Python mixin library for Django REST Framework batch deletion",
    longDescription:
      "Developed Deleterious, an open source Python mixin library for Django REST Framework to support efficient batch deletion via a single DELETE API request with customizable endpoints and DB queries. Published on Python Index (PyPI) and GitHub under MIT License for seamless integration into existing DRF codebases.",
    technologies: ["Python", "Django", "REST Framework", "PyPI"],
    githubUrl: "https://github.com/Gautam-Diwan/drf-deleterious",
    featured: false,
    startDate: "June 2024",
    endDate: "July 2024",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "Hirezen - AI-powered Service Provider Portal",
    description:
      "MERN web platform connecting customers with local service providers using AI scoring",
    longDescription:
      "Designed a PyTorch BERT pipeline for Hirezen, a MERN platform connecting customers in Tier-3 cities with local service providers, using Kolmogorov-Smirnov sampling-test scoring from user reviews. Integrated MERN CRUD APIs in Node.js, Express.js, and MongoDB for the service booking workflow.",
    technologies: [
      "PyTorch",
      "BERT",
      "MERN",
      "Node.js",
      "Express.js",
      "MongoDB",
    ],
    githubUrl: "https://github.com/YashKumar-0307/Hirezen",
    featured: false,
    startDate: "April 2022",
    endDate: "December 2022",
    category: "academic",
  });

  await ctx.db.insert("projects", {
    title: "Face Fusion",
    description:
      "DCGAN Generative AI architecture for synthetic anime face generation",
    longDescription:
      "Created a DCGAN Generative AI architecture from scratch in PyTorch to generate synthetic anime faces and detect fake ones, combining generator discriminator training. Applied Deep Learning and Computer Vision techniques for preprocessing data, hyperparameter tuning, model training, collage preparation, and evaluation for fast, optimal generative performance and distinguishing real vs generated images.",
    technologies: ["PyTorch", "DCGAN", "Computer Vision", "Deep Learning"],
    githubUrl: "https://github.com/Gautam-Diwan/Face-Fusion",
    featured: false,
    startDate: "May 2022",
    endDate: "June 2022",
    category: "personal",
  });

  await ctx.db.insert("projects", {
    title: "OuRooms Communications",
    description:
      "Ephemeral real-time multi-room chat platform with focus on user privacy",
    longDescription:
      "Created OuRooms, an ephemeral real-time multi-room chat platform using React, Node.js, Express.js, and Socket.io with a focus on user privacy and no data retention architecture. Added profanity filtering, location sharing via Geolocation API, and embedded video playback for user trust and usability.",
    technologies: [
      "React",
      "Node.js",
      "Express.js",
      "Socket.io",
      "Geolocation API",
    ],
    featured: false,
    startDate: "September 2021",
    endDate: "December 2021",
    category: "academic",
  });

  await ctx.db.insert("experiences", {
    company: "Skillbuilder.io (skilly)",
    position: "Go To Market AI/ML Engineer Intern",
    location: "Pittsburgh, PA",
    startDate: "May 2026",
    endDate: "August 2026",
    description: [
      "Built a 6-phase agentic research pipeline from scratch in n8n, then migrated it to Python/LangGraph for N-way parallel Claude fan-out (Send API) that n8n lacked, roughly halving runtime. Added SQLite checkpoint resume, FastAPI status-poll/resume, and prompt caching plus structured outputs and Agent Skills injection that cut LLM cost 40-50%.",
      "Hardened agent runs with circuit breakers, exponential backoff, and simulation-structured queues for fault-tolerant, exactly-once execution across the graph.",
      "Engineered an AI deck generator: DeckSpec to Jinja2/Playwright to PPTX with a critic-revise loop, Agent Skills prompt injection, and competitor-name scrubbing. Runs used on the order of 0.3-1.2M Anthropic cache-read tokens.",
      "Built Chat Simulator Studio (React 19 + TanStack Start): serverless Playwright PNG/ZIP screenshot API with headless Chromium, Clerk-gated OpenAPI 3.0 routes, and shareable config links. Deployed on Vercel and AWS Amplify.",
      "Engineered data lookup agents over IPEDS (35+ tables), College Scorecard (153 MB), NCSES HERD, and BLS (QCEW 2.2 GB, JOLTS, CES, OEWS) live via DuckDB and the Google Drive API, with zero in-memory fallback.",
      "Deployed OpenTelemetry (Grafana Tempo), Prometheus, Loki, and Langfuse on a 7-service Docker Compose stack.",
      "Built ICPs for Higher Ed and Staffing, refined cohorts with IPEDS, and targeted Directors and above across the US. Enriched leads with Clay, Claygents, and Claude, then ran 500+ outreaches via Lemlist across 5+ email and LinkedIn campaigns. Aided Pipedrive CRM sync for IQL quality, contributing potential $75k+ additional revenue into the MQL stage.",
    ],
    technologies: [
      "LangGraph",
      "Python",
      "Claude",
      "FastAPI",
      "React 19",
      "TanStack Start",
      "Playwright",
      "DuckDB",
      "Langfuse",
      "OpenTelemetry",
      "Clay",
      "Lemlist",
    ],
    type: "internship",
  });

  await ctx.db.insert("experiences", {
    company: "HCode Technologies",
    position: "Associate Software Engineer",
    location: "Karnal, India",
    startDate: "March 2024",
    endDate: "February 2025",
    description: [
      "Built B2B SaaS medical AI RAG bots via AWS Lambda, OpenAI, Postgres, Node.js, Twilio for hotline communication for US phones, incorporating sensitive data anonymization, dynamic phone allocation of 100+ numbers for clients.",
      "Developed a dashboard website for AI RAG hotline via React, Tanstack Query, Node.js Fastify, Sequelize with features like AI playground, model selection, dynamic client info prompt injection, emergency mode, guided mode enabling instant updates.",
      "Revamped Web3 website from full MVC to Docker based Microservices architecture for flexibility on AWS ECS and solely established CI/CD pipeline with Github Actions ensuring scalability and resilience for spike usage and high availability.",
      "Architected dynamic subscription billing for 3k+ users NFT marketplace with Stripe webhooks, adding adjustable subscription pricing/cycles, automated chargeback handling, blockchain based and AWS SES receipts for exclusive NFT drops.",
      "Engineered real time private equity investments workflows for a private equity platform by integrating Django APIs, Websockets, LangChain RAG and SQL agents, and Redis, Kafka streaming for scalable real time group and AI chats.",
    ],
    technologies: [
      "AWS Lambda",
      "OpenAI",
      "Postgres",
      "Node.js",
      "React",
      "Tanstack Query",
      "Fastify",
      "Sequelize",
      "Docker",
      "AWS ECS",
      "Github Actions",
      "Stripe",
      "Django",
      "Websockets",
      "LangChain",
      "Redis",
      "Kafka",
      "AWS SES",
    ],
    type: "work",
  });

  await ctx.db.insert("experiences", {
    company: "KDataScience Solutions",
    position: "Software Developer",
    location: "Gurugram, India (Remote)",
    startDate: "August 2023",
    endDate: "February 2024",
    description: [
      "Migrated core product, an Atlassian Jira alternative website and desktop app, with flagship product team and leadership from server side MVC to hybrid client side rendered JavaScript for improved UI and enabling 100% faster, mobile app like UX.",
      "Introduced project level notebooks with OpenAI GPT API integration to enhance collaboration and information among project members.",
      "Added simultaneous video and screen sharing, recording through WebRTC API, seen messages and minimised UIs to Microsoft Teams alternative product enabling focused project demos and group message accountability.",
    ],
    technologies: ["JavaScript", "WebRTC", "OpenAI", "MVC", "Jira", "Teams"],
    type: "work",
  });

  await ctx.db.insert("experiences", {
    company: "NIIT Learning Systems",
    position: "Associate Software Engineer Intern",
    location: "Gurugram, India (Remote)",
    startDate: "January 2023",
    endDate: "July 2023",
    description: [
      "Generated static internal employee web pages from UI designs for Shell, with HTML, CSS, and Bootstrap, ensuring sub-100ms response times for 500K+ users as a sole developer.",
      "Created and tested scalable, maintainable code for multiple college application portals in Java, JBoss, SQL Server and performance testing strategies with Varnish and GTMetrix, focusing on API optimization.",
    ],
    technologies: [
      "HTML",
      "CSS",
      "Bootstrap",
      "Java",
      "JBoss",
      "SQL Server",
      "Varnish",
      "GTMetrix",
    ],
    type: "internship",
  });

  const programmingLanguages = [
    { name: "Python", level: 5, featured: true },
    { name: "TypeScript", level: 5, featured: true },
    { name: "JavaScript", level: 5, featured: true },
    { name: "CUDA", level: 4, featured: true },
    { name: "C++", level: 4, featured: true },
    { name: "Go", level: 4, featured: false },
    { name: "Java", level: 4, featured: false },
    { name: "C", level: 3, featured: false },
  ];

  for (const lang of programmingLanguages) {
    await ctx.db.insert("skills", {
      category: "Programming Languages",
      name: lang.name,
      level: lang.level,
      featured: lang.featured,
    });
  }

  const frameworks = [
    { name: "React", level: 5, featured: true },
    { name: "Node.js", level: 5, featured: true },
    { name: "FastAPI", level: 4, featured: true },
    { name: "Next.js", level: 4, featured: true },
    { name: "Django", level: 4, featured: true },
    { name: "Express.js", level: 4, featured: false },
    { name: "Fastify", level: 4, featured: false },
    { name: "TanStack Query", level: 4, featured: false },
    { name: "TanStack Start", level: 4, featured: false },
    { name: "Pydantic", level: 4, featured: false },
    { name: "ShadCN", level: 4, featured: false },
    { name: "Tailwind CSS", level: 5, featured: false },
    { name: "Playwright", level: 4, featured: false },
    { name: "Jinja2", level: 3, featured: false },
    { name: "Convex", level: 4, featured: false },
    { name: "Hermes", level: 3, featured: false },
    { name: "OpenClaw", level: 3, featured: false },
  ];

  for (const framework of frameworks) {
    await ctx.db.insert("skills", {
      category: "Frameworks & Libraries",
      name: framework.name,
      level: framework.level,
      featured: framework.featured,
    });
  }

  const databaseTools = [
    { name: "Postgres", level: 5, featured: true },
    { name: "AWS", level: 4, featured: true },
    { name: "Docker", level: 4, featured: true },
    { name: "Kubernetes", level: 4, featured: true },
    { name: "Terraform", level: 4, featured: true },
    { name: "Ansible", level: 3, featured: false },
    { name: "GCP", level: 3, featured: false },
    { name: "Vercel", level: 4, featured: false },
    { name: "Modal", level: 3, featured: false },
    { name: "Redis", level: 4, featured: false },
    { name: "Kafka", level: 4, featured: false },
    { name: "MongoDB", level: 4, featured: false },
    { name: "DuckDB", level: 3, featured: false },
    { name: "SQLite", level: 4, featured: false },
    { name: "SQL", level: 5, featured: false },
    { name: "OpenTelemetry", level: 3, featured: false },
    { name: "Grafana", level: 3, featured: false },
    { name: "Git", level: 5, featured: false },
    { name: "GitHub", level: 5, featured: false },
    { name: "Stripe", level: 4, featured: false },
    { name: "Twilio", level: 3, featured: false },
    { name: "Jenkins", level: 3, featured: false },
    { name: "UV", level: 3, featured: false },
    { name: "WandB", level: 3, featured: false },
    { name: "Clay", level: 3, featured: false },
    { name: "Lemlist", level: 3, featured: false },
    { name: "Pipedrive", level: 3, featured: false },
  ];

  for (const tool of databaseTools) {
    await ctx.db.insert("skills", {
      category: "Databases & Tools",
      name: tool.name,
      level: tool.level,
      featured: tool.featured,
    });
  }

  const aiTools = [
    { name: "LangGraph", level: 5, featured: true },
    { name: "PyTorch", level: 4, featured: true },
    { name: "LangChain", level: 4, featured: true },
    { name: "OpenAI", level: 4, featured: true },
    { name: "Anthropic", level: 4, featured: true },
    { name: "TensorFlow", level: 3, featured: false },
    { name: "Apache TVM", level: 3, featured: false },
    { name: "MLX", level: 3, featured: false },
    { name: "oMLX", level: 3, featured: false },
    { name: "vLLM", level: 3, featured: false },
    { name: "llama.cpp", level: 3, featured: false },
    { name: "Langfuse", level: 3, featured: false },
    { name: "RAG", level: 4, featured: false },
    { name: "Prompt Caching", level: 4, featured: false },
    { name: "Structured Outputs", level: 4, featured: false },
    { name: "MCP", level: 3, featured: false },
    { name: "BERT", level: 3, featured: false },
    { name: "Diffusion / Flow Matching", level: 4, featured: false },
    { name: "Computer Vision", level: 3, featured: false },
    { name: "Deep Learning", level: 4, featured: false },
  ];

  for (const tool of aiTools) {
    await ctx.db.insert("skills", {
      category: "AI & Machine Learning",
      name: tool.name,
      level: tool.level,
      featured: tool.featured,
    });
  }

  await ctx.db.insert("skills", {
    category: "_meta",
    name: "contentVersion",
    level: CONTENT_VERSION,
    featured: false,
  });
}

export const seedPortfolioData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSkills = await ctx.db.query("skills").collect();
    const meta = existingSkills.find(
      (skill) =>
        skill.category === "_meta" && skill.name === "contentVersion",
    );
    if (meta && meta.level >= CONTENT_VERSION) {
      return "Portfolio content is up to date";
    }

    await clearPortfolioTables(ctx);
    await insertPortfolioData(ctx);
    return "Portfolio data seeded successfully";
  },
});
