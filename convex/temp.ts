import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const forceCreateUser = mutation({
  args: { email: v.string(), username: v.string(), password: v.string() },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
        email: args.email,
        username: args.username,
        balance: 100,
        level: 1,
        exp: 0,
        totalDeposited: 0,
    });
  }
});
