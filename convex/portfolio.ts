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
    // Featured Projects
    await ctx.db.insert("projects", {
      title: "Globetrotter",
      description: "Full-stack travel quiz platform for famous destinations",
      longDescription: "Developed a full-stack travel quiz platform for famous destinations using Next.js, TypeScript, Tailwind CSS, Supabase, Postgres, and Prisma ORM, featuring cryptic clue gameplay, score tracking, and challenge invites via WhatsApp. Implemented randomized destination selection, multiple choice APIs, and animated feedback with canvas-confetti, deployed on Vercel with serverless functions for zero cost, scalable performance.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Postgres", "Prisma", "Vercel"],
      featured: true,
      startDate: "March 2025",
      endDate: "April 2025",
      category: "personal",
    });

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

    // Additional Projects
    await ctx.db.insert("projects", {
      title: "Go Djan",
      description: "Web service providing CRUD APIs for blogs, tags, users, and friendships",
      longDescription: "Built a web service providing CRUD APIs for blogs, tags, users, and friendships, with Bcrypt and Paseto authentication for better security over JWT. Integrated Postgres with Ent ORM for data persistence, leveraging Go's concurrency model to deliver scalable, high performance requests with minimal resource utilization.",
      technologies: ["Go", "Postgres", "Ent ORM", "Bcrypt", "Paseto"],
      featured: false,
      startDate: "August 2024",
      endDate: "September 2024",
      category: "personal",
    });

    await ctx.db.insert("projects", {
      title: "OuRooms Communications",
      description: "Ephemeral real-time multi-room chat platform with focus on user privacy",
      longDescription: "Created OuRooms, an ephemeral real-time multi-room chat platform using React, Node.js, Express.js, and Socket.io with a focus on user privacy and no data retention architecture. Added profanity filtering, location sharing via Geolocation API, and embedded video playback for user trust and usability.",
      technologies: ["React", "Node.js", "Express.js", "Socket.io", "Geolocation API"],
      featured: false,
      startDate: "September 2021",
      endDate: "December 2021",
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
      technologies: ["AWS Lambda", "OpenAI", "Postgres", "Node.js", "React", "Tanstack Query", "Fastify", "Sequelize", "Docker", "AWS ECS", "Github Actions", "Stripe", "Django", "Websockets", "LangChain", "Redis", "Kafka", "AWS SES"],
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
        "Added simultaneous video and screen sharing, recording through WebRTC API, seen messages and minimised UIs to Microsoft Teams alternative product enabling focused project demos and group message accountability."
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
        "Created and tested scalable, maintainable code for multiple college application portals in Java, JBoss, SQL Server and performance testing strategies with Varnish and GTMetrix, focusing on API optimization."
      ],
      technologies: ["HTML", "CSS", "Bootstrap", "Java", "JBoss", "SQL Server", "Varnish", "GTMetrix"],
      type: "internship",
    });

    // Seed skills - Programming Languages
    const programmingLanguages = [
      { name: "Python", level: 5, featured: true },
      { name: "JavaScript", level: 5, featured: true },
      { name: "TypeScript", level: 5, featured: true },
      { name: "Java", level: 4, featured: true },
      { name: "Go", level: 4, featured: false },
      { name: "C++", level: 4, featured: false },
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

    // Seed skills - Frontend & Backend
    const frameworks = [
      { name: "React", level: 5, featured: true },
      { name: "Node.js", level: 5, featured: true },
      { name: "Next.js", level: 4, featured: true },
      { name: "Express.js", level: 4, featured: true },
      { name: "Django", level: 4, featured: true },
      { name: "Fastify", level: 4, featured: false },
      { name: "Tanstack Query", level: 4, featured: false },
      { name: "ShadCN", level: 4, featured: false },
      { name: "Tailwind CSS", level: 5, featured: false },
    ];
    
    for (const framework of frameworks) {
      await ctx.db.insert("skills", {
        category: "Frameworks & Libraries",
        name: framework.name,
        level: framework.level,
        featured: framework.featured,
      });
    }

    // Seed skills - Databases & Tools
    const databaseTools = [
      { name: "Postgres", level: 5, featured: true },
      { name: "AWS", level: 4, featured: true },
      { name: "Docker", level: 4, featured: true },
      { name: "Redis", level: 4, featured: false },
      { name: "Kafka", level: 4, featured: false },
      { name: "MongoDB", level: 4, featured: false },
      { name: "Git", level: 5, featured: false },
      { name: "Github", level: 5, featured: false },
      { name: "Stripe", level: 4, featured: false },
      { name: "AWS Lambda", level: 4, featured: false },
      { name: "AWS ECS", level: 4, featured: false },
      { name: "SQL", level: 5, featured: false },
    ];
    
    for (const tool of databaseTools) {
      await ctx.db.insert("skills", {
        category: "Databases & Tools",
        name: tool.name,
        level: tool.level,
        featured: tool.featured,
      });
    }

    // Seed skills - AI & ML
    const aiTools = [
      { name: "LangChain", level: 4, featured: true },
      { name: "PyTorch", level: 4, featured: true },
      { name: "OpenAI", level: 4, featured: true },
      { name: "BERT", level: 3, featured: false },
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

    return "Portfolio data seeded successfully";
  },
});
