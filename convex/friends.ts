import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendRequest = mutation({
  args: { targetUserId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    if (userId === args.targetUserId) throw new Error("Cannot add yourself");

    const existing = await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1", userId).eq("user2", args.targetUserId))
      .first();

    const existingReverse = await ctx.db
      .query("friends")
      .withIndex("by_users", (q) => q.eq("user1", args.targetUserId).eq("user2", userId))
      .first();

    if (existing || existingReverse) throw new Error("Request already exists or already friends");

    await ctx.db.insert("friends", {
      user1: userId,
      user2: args.targetUserId,
      status: "pending",
    });

    const sender = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: args.targetUserId,
      type: "friend_request",
      content: `${sender?.username} sent you a friend request.`,
      isRead: false,
      metadata: { fromId: userId },
    });

    return null;
  },
});

export const acceptRequest = mutation({
  args: { requestId: v.id("friends") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const request = await ctx.db.get(args.requestId);
    if (!request || request.user2 !== userId || request.status !== "pending") {
      throw new Error("Invalid request");
    }

    await ctx.db.patch(args.requestId, { status: "accepted" });

    const receiver = await ctx.db.get(userId);
    await ctx.db.insert("notifications", {
      userId: request.user1,
      type: "friend_accept",
      content: `${receiver?.username} accepted your friend request.`,
      isRead: false,
      metadata: { fromId: userId },
    });

    return null;
  },
});

export const getFriends = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const f1 = await ctx.db
      .query("friends")
      .withIndex("by_user1", (q) => q.eq("user1", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const f2 = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friendIds = [
      ...f1.map((f) => f.user2),
      ...f2.map((f) => f.user1),
    ];

    const friends = [];
    for (const id of friendIds) {
      const u = await ctx.db.get(id);
      if (u) friends.push(u);
    }
    return friends;
  },
});

export const getIncomingRequests = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const requests = await ctx.db
      .query("friends")
      .withIndex("by_user2", (q) => q.eq("user2", userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const res = [];
    for (const r of requests) {
      const sender = await ctx.db.get(r.user1);
      if (sender) {
        res.push({ ...r, sender });
      }
    }
    return res;
  },
});
