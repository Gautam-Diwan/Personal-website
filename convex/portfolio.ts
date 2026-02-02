import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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

export const seedPortfolioData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingProjects = await ctx.db.query("projects").take(1);
    if (existingProjects.length > 0) {
      return "Data already exists";
    }

    // Seed projects
    await ctx.db.insert("projects", {
      title: "Deleterious",
      description: "Open source Python mixin library for Django REST Framework batch deletion",
      longDescription: "Developed Deleterious, an open source Python mixin library for Django REST Framework to support efficient batch deletion via a single DELETE API request with customizable endpoints and DB queries. Published on Python Index (PyPI) and GitHub under MIT License for seamless integration into existing DRF codebases.",
      technologies: ["Python", "Django", "REST Framework", "PyPI"],
      githubUrl: "https://github.com/Gautam-Diwan/deleterious",
      featured: true,
      startDate: "June 2024",
      endDate: "July 2024",
      category: "personal",
    });

    await ctx.db.insert("projects", {
      title: "Hirezen - AI-powered Service Provider Portal",
      description: "MERN web platform connecting customers with local service providers using AI scoring",
      longDescription: "Designed PyTorch based BERT Transformer model pipeline for Hirezen, MERN web platform to connect customers in Tier-3 cities with local service providers (carpenters, plumbers, etc.) for servicemen scoring based upon user reviews. Integrated MERN CRUD APIs in Node.js, Express.js and MongoDB needed to implement service booking workflow.",
      technologies: ["PyTorch", "BERT", "MERN", "Node.js", "Express.js", "MongoDB"],
      featured: true,
      startDate: "April 2022",
      endDate: "December 2022",
      category: "academic",
    });

    await ctx.db.insert("projects", {
      title: "Face Fusion",
      description: "DCGAN Generative AI architecture for synthetic anime face generation",
      longDescription: "Created a DCGAN Generative AI architecture from scratch in PyTorch to generate synthetic anime faces and detect fake ones, combining generator discriminator training. Applied Deep Learning and Computer Vision techniques for preprocessing data, hyperparameter tuning, model training, collage preparation, and evaluation for fast, optimal generative performance and distinguishing real vs generated images.",
      technologies: ["PyTorch", "DCGAN", "Computer Vision", "Deep Learning"],
      featured: false,
      startDate: "May 2022",
      endDate: "June 2022",
      category: "personal",
    });

    // Seed experiences
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
        "Engineered real time private equity investments workflows for a private equity platform by integrating Django APIs, Websockets, LangChain RAG and SQL agents, and Redis, Kafka streaming for scalable real time group and AI chats."
      ],
      technologies: ["AWS Lambda", "OpenAI", "Postgres", "Node.js", "React", "Tanstack Query", "Docker", "AWS ECS", "Stripe", "Django", "Redis", "Kafka"],
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
        "Introduced project level notebooks with GPT integration to enhance collaboration and information among project members.",
        "Added simultaneous video and screen sharing, recording through WebRTC API, seen messages and minimised UIs to Microsoft Teams alternative product enabling focused project demos and group message accountability."
      ],
      technologies: ["JavaScript", "WebRTC", "GPT", "MVC"],
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
        "Created and tested scalable, maintainable code for multiple college application portals in Java, JBoss, SQL Server and performance testing strategies with Varnish and GTMetrix, focusing on API optimization."
      ],
      technologies: ["HTML", "CSS", "Bootstrap", "Java", "JBoss", "SQL Server"],
      type: "internship",
    });

    // Seed skills
    const programmingLanguages = ["Python", "JavaScript", "TypeScript", "C", "C++", "Java", "Go"];
    for (const lang of programmingLanguages) {
      await ctx.db.insert("skills", {
        category: "Programming Languages",
        name: lang,
        level: ["Python", "JavaScript", "TypeScript"].includes(lang) ? 5 : 4,
        featured: ["Python", "JavaScript", "TypeScript", "Java"].includes(lang),
      });
    }

    const frameworks = ["React", "Node.js", "Django", "Next.js", "Express.js", "Fastify"];
    for (const framework of frameworks) {
      await ctx.db.insert("skills", {
        category: "Frameworks",
        name: framework,
        level: ["React", "Node.js", "Django"].includes(framework) ? 5 : 4,
        featured: ["React", "Node.js", "Django", "Next.js"].includes(framework),
      });
    }

    const tools = ["AWS", "Docker", "Git", "Postgres", "Redis", "Kafka"];
    for (const tool of tools) {
      await ctx.db.insert("skills", {
        category: "Tools & Technologies",
        name: tool,
        level: 4,
        featured: ["AWS", "Docker", "Postgres"].includes(tool),
      });
    }

    return "Portfolio data seeded successfully";
  },
});
