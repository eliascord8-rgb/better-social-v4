import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDebugUsers = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(5).collect();
  },
});

export const getDebugAccounts = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("authAccounts").order("desc").take(5).collect();
  },
});
