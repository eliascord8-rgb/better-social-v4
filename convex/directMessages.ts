import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: { 
    receiverId: v.id("users"), 
    message: v.optional(v.string()), 
    imageUrl: v.optional(v.string()) 
  },
  returns: v.id("directMessages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const dmId = await ctx.db.insert("directMessages", {
      senderId: userId,
      receiverId: args.receiverId,
      message: args.message,
      imageUrl: args.imageUrl,
      isRead: false,
    });

    const sender = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: args.receiverId,
      type: "dm",
      content: `New message from ${sender?.username}`,
      isRead: false,
      metadata: { fromId: userId },
    });

    return dmId;
  },
});

export const getMessages = query({
  args: { otherUserId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const m1 = await ctx.db
      .query("directMessages")
      .withIndex("conversation", (q) => q.eq("senderId", userId).eq("receiverId", args.otherUserId))
      .collect();

    const m2 = await ctx.db
      .query("directMessages")
      .withIndex("conversation", (q) => q.eq("senderId", args.otherUserId).eq("receiverId", userId))
      .collect();

    return [...m1, ...m2].sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const markRead = mutation({
  args: { senderId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const unread = await ctx.db
      .query("directMessages")
      .withIndex("conversation", (q) => q.eq("senderId", args.senderId).eq("receiverId", userId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const msg of unread) {
      await ctx.db.patch(msg._id, { isRead: true });
    }

    return null;
  },
});
