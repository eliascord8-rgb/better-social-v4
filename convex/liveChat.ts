import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const startSession = mutation({
  args: { guestId: v.string() },
  returns: v.id("liveChatSessions"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("liveChatSessions")
      .withIndex("by_guestId", (q) => q.eq("guestId", args.guestId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("liveChatSessions", {
      guestId: args.guestId,
      status: "active",
    });
  },
});

export const sendMessage = mutation({
  args: { 
    sessionId: v.id("liveChatSessions"), 
    senderName: v.string(), 
    message: v.string(), 
    isAdmin: v.boolean(),
    isSystem: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("liveChatMessages", {
      sessionId: args.sessionId,
      senderName: args.senderName,
      message: args.message,
      isAdmin: args.isAdmin,
    });

    await ctx.db.patch(args.sessionId, {
        operatorName: args.isAdmin ? args.senderName : undefined,
        hasUnreadAdminReply: args.isAdmin ? true : false,
    });

    return null;
  },
});

export const joinSession = mutation({
    args: { sessionId: v.id("liveChatSessions"), operatorName: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.sessionId);
        if (!session) throw new Error("Session not found");
        
        // Only add "operator joined" if not already joined or if different operator
        if (session.operatorName !== args.operatorName) {
            await ctx.db.insert("liveChatMessages", {
                sessionId: args.sessionId,
                senderName: "System",
                message: `${args.operatorName} joined the transmission.`,
                isAdmin: true,
            });

            await ctx.db.patch(args.sessionId, {
                operatorName: args.operatorName,
            });
        }
        return null;
    }
});

export const markLiveChatRead = mutation({
    args: { guestId: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("liveChatSessions")
            .withIndex("by_guestId", q => q.eq("guestId", args.guestId))
            .filter(q => q.eq(q.field("status"), "active"))
            .first();
        
        if (session) {
            await ctx.db.patch(session._id, { hasUnreadAdminReply: false });
        }
        return null;
    }
});

export const getActiveSessions = query({
    args: {},
    returns: v.array(v.object({
        _id: v.id("liveChatSessions"),
        _creationTime: v.number(),
        guestId: v.string(),
        userId: v.optional(v.id("users")),
        operatorName: v.optional(v.string()),
        status: v.string(),
        hasUnreadAdminReply: v.optional(v.boolean()),
        lastMessage: v.optional(v.string()),
    })),
    handler: async (ctx) => {
        const sessions = await ctx.db.query("liveChatSessions").order("desc").take(50);
        const results = [];
        for (const session of sessions) {
            const lastMsg = await ctx.db
                .query("liveChatMessages")
                .withIndex("by_session", q => q.eq("sessionId", session._id))
                .order("desc")
                .first();
            
            results.push({
                ...session,
                lastMessage: lastMsg?.message,
            });
        }
        return results;
    }
});

export const getSession = query({
    args: { sessionId: v.id("liveChatSessions") },
    returns: v.union(v.null(), v.object({
        _id: v.id("liveChatSessions"),
        _creationTime: v.number(),
        guestId: v.string(),
        userId: v.optional(v.id("users")),
        operatorName: v.optional(v.string()),
        status: v.string(),
        hasUnreadAdminReply: v.optional(v.boolean()),
    })),
    handler: async (ctx, args) => {
        return await ctx.db.get(args.sessionId);
    }
});


export const getMessages = query({
  args: { sessionId: v.id("liveChatSessions") },
  returns: v.array(v.object({
    _id: v.id("liveChatMessages"),
    _creationTime: v.number(),
    sessionId: v.id("liveChatSessions"),
    senderName: v.string(),
    message: v.string(),
    isAdmin: v.boolean(),
  })),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("liveChatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const getMyUnreadCount = query({
    args: { guestId: v.optional(v.string()) },
    returns: v.number(),
    handler: async (ctx, args) => {
        let session;
        if (args.guestId) {
            session = await ctx.db
                .query("liveChatSessions")
                .withIndex("by_guestId", q => q.eq("guestId", args.guestId!))
                .filter(q => q.eq(q.field("status"), "active"))
                .first();
        }
        
        if (session?.hasUnreadAdminReply) return 1;
        return 0;
    }
});

