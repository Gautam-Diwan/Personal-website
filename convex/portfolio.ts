import { query, mutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { projects, experiences, skills } from "./content";

/**
 * Bump this whenever convex/content.ts changes. The first visitor after a
 * deploy triggers `seedPortfolioData`, which replaces the portfolio tables.
 * Keep in sync with CONTENT_VERSION in src/lib/content.ts.
 */
export const CONTENT_VERSION = 6;

const byRecency = <T extends { sortKey?: number; _creationTime: number }>(
  a: T,
  b: T,
) => (b.sortKey ?? 0) - (a.sortKey ?? 0) || a._creationTime - b._creationTime;

export const getProjects = query({
  args: {
    featured: v.optional(v.boolean()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rows;
    if (args.featured !== undefined) {
      rows = await ctx.db
        .query("projects")
        .withIndex("by_featured", (q) => q.eq("featured", args.featured!))
        .collect();
    } else if (args.category) {
      rows = await ctx.db
        .query("projects")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      rows = await ctx.db.query("projects").collect();
    }
    return rows.sort(byRecency);
  },
});

export const getExperiences = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("experiences").collect();
    return rows.sort(byRecency);
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
  for (const table of ["projects", "experiences", "skills"] as const) {
    const rows = await ctx.db.query(table).collect();
    for (const row of rows) {
      await ctx.db.delete(row._id);
    }
  }
}

async function insertPortfolioData(ctx: MutationCtx) {
  for (const project of projects) {
    await ctx.db.insert("projects", project);
  }
  for (const experience of experiences) {
    await ctx.db.insert("experiences", experience);
  }
  for (const group of skills) {
    for (const [i, name] of group.items.entries()) {
      await ctx.db.insert("skills", {
        category: group.category,
        name,
        level: 4,
        featured: i < 4,
      });
    }
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
    const meta = (await ctx.db.query("skills").collect()).find(
      (skill) => skill.category === "_meta" && skill.name === "contentVersion",
    );
    if (meta && meta.level >= CONTENT_VERSION) {
      return "Portfolio content is up to date";
    }

    await clearPortfolioTables(ctx);
    await insertPortfolioData(ctx);
    return "Portfolio data seeded successfully";
  },
});
