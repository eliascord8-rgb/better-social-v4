import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyNotifications = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);

    const globalNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), undefined))
      .order("desc")
      .take(10);

    return [...userNotifications, ...globalNotifications].sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const markAllRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
    return null;
  },
});
