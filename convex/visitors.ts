import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkPopupStatus = mutation({
  args: { ip: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("visitorPopupStatus")
      .withIndex("by_ip", (q) => q.eq("ip", args.ip))
      .first();

    if (status) {
      return status.hasSeenBonus;
    }

    // If not found, create it as not seen yet (but we'll likely mark it seen immediately after this)
    await ctx.db.insert("visitorPopupStatus", {
      ip: args.ip,
      hasSeenBonus: false,
    });
    return false;
  },
});

export const markPopupAsSeen = mutation({
  args: { ip: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const status = await ctx.db
      .query("visitorPopupStatus")
      .withIndex("by_ip", (q) => q.eq("ip", args.ip))
      .first();

    if (status) {
      await ctx.db.patch(status._id, { hasSeenBonus: true });
    } else {
      await ctx.db.insert("visitorPopupStatus", {
        ip: args.ip,
        hasSeenBonus: true,
      });
    }
    return null;
  },
});
