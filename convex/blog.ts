import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAllPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .take(args.limit || 10);

    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author ? { name: author.name, email: author.email } : null,
        };
      })
    );
  },
});

export const getPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) {
      return null;
    }

    const author = await ctx.db.get(post.authorId);
    return {
      ...post,
      author: author ? { name: author.name, email: author.email } : null,
    };
  },
});

export const searchPosts = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) {
      return [];
    }

    const posts = await ctx.db
      .query("blogPosts")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query).eq("published", true)
      )
      .take(args.limit || 5);

    return Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        return {
          ...post,
          author: author ? { name: author.name, email: author.email } : null,
        };
      })
    );
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    published: v.boolean(),
    readTime: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a post");
    }

    const existingPost = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existingPost) {
      throw new Error("A post with this slug already exists");
    }

    return await ctx.db.insert("blogPosts", {
      ...args,
      authorId: userId,
      publishedAt: args.published ? Date.now() : undefined,
    });
  },
});

export const deletePost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to delete a post");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    await ctx.db.delete(args.postId);
  },
});
