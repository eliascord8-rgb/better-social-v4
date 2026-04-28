import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createTicket = mutation({
  args: { subject: v.string(), message: v.string() },
  returns: v.id("tickets"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ticketId = await ctx.db.insert("tickets", {
      userId,
      subject: args.subject,
      status: "open",
      lastUpdate: Date.now(),
    });

    await ctx.db.insert("ticketMessages", {
      ticketId,
      senderId: userId,
      message: args.message,
      isAdmin: false,
    });

    return ticketId;
  },
});

export const getMyTickets = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("tickets"),
    _creationTime: v.number(),
    userId: v.id("users"),
    subject: v.string(),
    status: v.string(),
    lastUpdate: v.number(),
    hasUnreadAdminReply: v.optional(v.boolean()),
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const replyToTicket = mutation({
    args: { ticketId: v.id("tickets"), message: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const user = await ctx.db.get(userId);
        if (!user) throw new Error("User not found");

        const isAdmin = user.isAdmin || user.isMod || false;

        await ctx.db.insert("ticketMessages", {
            ticketId: args.ticketId,
            senderId: userId,
            message: args.message,
            isAdmin,
        });

        await ctx.db.patch(args.ticketId, {
            lastUpdate: Date.now(),
            hasUnreadAdminReply: isAdmin ? true : false,
        });

        return null;
    }
});

export const markTicketRead = mutation({
    args: { ticketId: v.id("tickets") },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.patch(args.ticketId, { hasUnreadAdminReply: false });
        return null;
    }
});

export const getAllTicketsAdmin = query({
    args: {},
    returns: v.array(v.object({
        _id: v.id("tickets"),
        _creationTime: v.number(),
        userId: v.id("users"),
        subject: v.string(),
        status: v.string(),
        lastUpdate: v.number(),
        hasUnreadAdminReply: v.optional(v.boolean()),
    })),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        const user = await ctx.db.get(userId);
        if (!user?.isAdmin && !user?.isMod) return [];

        return await ctx.db
            .query("tickets")
            .order("desc")
            .collect();
    }
});

export const getTicketMessages = query({
    args: { ticketId: v.id("tickets") },
  returns: v.array(v.object({
    _id: v.id("ticketMessages"),
    _creationTime: v.number(),
    ticketId: v.id("tickets"),
    senderId: v.id("users"),
    message: v.string(),
    isAdmin: v.boolean(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();
  },
});
