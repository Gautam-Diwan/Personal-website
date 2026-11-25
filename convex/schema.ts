import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  blogPosts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    authorId: v.id("users"),
    readTime: v.number(), // in minutes
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published"])
    .index("by_author", ["authorId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["published", "authorId"],
    }),

  projects: defineTable({
    title: v.string(),
    description: v.string(),
    longDescription: v.string(),
    technologies: v.array(v.string()),
    githubUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    featured: v.boolean(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    category: v.string(), // "work", "personal", "academic", "open-source"
    // v3 fields (optional so pre-v3 rows stay valid during migration)
    slug: v.optional(v.string()),
    context: v.optional(v.string()),
    groups: v.optional(v.array(v.string())), // "systems" | "ml" | "ai" | "web"
    highlights: v.optional(v.array(v.string())),
    metrics: v.optional(
      v.array(v.object({ label: v.string(), value: v.string() })),
    ),
    sortKey: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"])
    .index("by_category", ["category"]),

  experiences: defineTable({
    company: v.string(),
    position: v.string(),
    location: v.string(),
    startDate: v.string(),
    endDate: v.optional(v.string()),
    description: v.array(v.string()),
    technologies: v.array(v.string()),
    type: v.string(), // "work", "internship", "practicum"
    summary: v.optional(v.string()),
    groups: v.optional(v.array(v.string())),
    sortKey: v.optional(v.number()),
  }),

  skills: defineTable({
    category: v.string(),
    name: v.string(),
    level: v.number(), // 1-5
    featured: v.boolean(),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
