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
    category: v.string(), // "work", "personal", "academic"
  })
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
    type: v.string(), // "work", "internship", "freelance"
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
