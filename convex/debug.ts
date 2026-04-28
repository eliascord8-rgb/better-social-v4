import { query } from "./_generated/server";
import { v } from "convex/values";

export const listRecentUsers = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").take(5);
  },
});
