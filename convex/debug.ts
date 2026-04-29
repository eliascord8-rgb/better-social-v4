import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDebugUsers = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    // take(5) returns a Promise of an array, so we don't call collect()
    return await ctx.db.query("users").order("desc").take(5);
  },
});

export const getDebugAccounts = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("authAccounts").order("desc").take(5);
  },
});

export const getDebugRegistry = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("userRegistry").order("desc").take(5);
  },
});

export const seedTestUser = mutation({
  args: { username: v.string(), email: v.string(), password: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
        username: args.username,
        email: args.email,
        balance: 0,
        level: 10,
    });
    return userId;
  }
});
