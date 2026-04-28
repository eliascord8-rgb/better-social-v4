import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const sendMessage = mutation({
  args: { 
    receiverId: v.id("users"), 
    message: v.optional(v.string()), 
    audioStorageId: v.optional(v.id("_storage")) 
  },
  returns: v.id("directMessages"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let audioUrl = undefined;
    if (args.audioStorageId) {
      const url = await ctx.storage.getUrl(args.audioStorageId);
      if (url) audioUrl = url;
    }

    return await ctx.db.insert("directMessages", {
      senderId: userId,
      receiverId: args.receiverId,
      message: args.message,
      audioUrl,
      isRead: false,
    });
  },
});

export const getConversations = query({
  args: {},
  returns: v.array(v.object({
    otherUser: v.object({
      _id: v.id("users"),
      username: v.optional(v.string()),
      image: v.optional(v.string()),
    }),
    lastMessage: v.object({
        message: v.optional(v.string()),
        audioUrl: v.optional(v.string()),
        _creationTime: v.number(),
    }),
    unreadCount: v.number(),
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const sent = await ctx.db.query("directMessages").withIndex("by_sender", q => q.eq("senderId", userId)).collect();
    const received = await ctx.db.query("directMessages").withIndex("by_receiver", q => q.eq("receiverId", userId)).collect();
    
    const allMessages = [...sent, ...received].sort((a, b) => b._creationTime - a._creationTime);
    
    const conversationMap = new Map<string, any>();
    
    for (const msg of allMessages) {
        const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (conversationMap.has(otherId.toString())) continue;
        
        const otherUser = await ctx.db.get(otherId);
        if (!otherUser) continue;

        const unreadCount = received.filter(m => m.senderId === otherId && !m.isRead).length;

        conversationMap.set(otherId.toString(), {
            otherUser: {
                _id: otherUser._id,
                username: otherUser.username,
                image: otherUser.image,
            },
            lastMessage: {
                message: msg.message,
                audioUrl: msg.audioUrl,
                _creationTime: msg._creationTime,
            },
            unreadCount,
        });
    }

    return Array.from(conversationMap.values());
  },
});

export const getMessages = query({
  args: { otherUserId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("directMessages"),
    _creationTime: v.number(),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    isRead: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const m1 = await ctx.db
        .query("directMessages")
        .withIndex("conversation", q => q.eq("senderId", userId).eq("receiverId", args.otherUserId))
        .collect();
    
    const m2 = await ctx.db
        .query("directMessages")
        .withIndex("conversation", q => q.eq("senderId", args.otherUserId).eq("receiverId", userId))
        .collect();

    return [...m1, ...m2].sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const markRead = mutation({
    args: { otherUserId: v.id("users") },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const unread = await ctx.db
            .query("directMessages")
            .withIndex("conversation", q => q.eq("senderId", args.otherUserId).eq("receiverId", userId))
            .filter(q => q.eq(q.field("isRead"), false))
            .collect();

        for (const msg of unread) {
            await ctx.db.patch(msg._id, { isRead: true });
        }
        return null;
    }
});

export const generateUploadUrl = mutation({
    args: {},
    returns: v.string(),
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
