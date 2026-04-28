import { query, mutation, internalMutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const getMessages = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("communityMessages"),
    _creationTime: v.number(),
    userId: v.id("users"),
    username: v.string(),
    message: v.union(v.string(), v.null()),
    audioUrl: v.union(v.string(), v.null()),
    role: v.string(),
    level: v.number(),
  })),
  handler: async (ctx) => {
    const messages = await ctx.db
      .query("communityMessages")
      .order("desc")
      .take(50);
    
    // Reverse to get chronological order (oldest to newest)
    // so that the newest message is rendered at the bottom.
    return messages.reverse().map(m => {
        const { message, audioUrl, ...rest } = m;
        return {
            ...rest,
            message: message ?? null,
            audioUrl: audioUrl ?? null,
        } as any;
    });
  },
});

export const sendMessage = mutation({
  args: { message: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.isBanned) throw new Error("You are banned from chat");
    
    if (user.muteUntil && user.muteUntil > Date.now()) {
        const remaining = Math.ceil((user.muteUntil - Date.now()) / 1000 / 60);
        throw new Error(`You are muted for ${remaining} more minutes`);
    }

    // Handle Commands
    if (args.message.startsWith("/")) {
        const parts = args.message.split(" ");
        const command = parts[0].toLowerCase();

        if (command === "/clearchat" && (user.isAdmin || user.isMod)) {
            const messages = await ctx.db.query("communityMessages").collect();
            for (const m of messages) {
                await ctx.db.delete(m._id);
            }
            return null;
        }

        if (command === "/mute" && (user.isAdmin || user.isMod)) {
            // /mute <username> <duration> (e.g. 1min, 1h, 1d)
            const targetUsername = parts[1];
            const durationStr = parts[2] || "1min";
            
            const target = await ctx.db.query("users").withIndex("username", q => q.eq("username", targetUsername)).first();
            if (target) {
                let durationMs = 60000; // default 1 min
                const num = parseInt(durationStr);
                if (!isNaN(num)) {
                    if (durationStr.includes("min")) durationMs = num * 60000;
                    else if (durationStr.includes("h")) durationMs = num * 3600000;
                    else if (durationStr.includes("d")) durationMs = num * 86400000;
                }
                
                await ctx.db.patch(target._id, { muteUntil: Date.now() + durationMs });
                
                await ctx.db.insert("communityMessages", {
                    userId,
                    username: "SYSTEM",
                    message: `${target.username} has been muted for ${durationStr} by ${user.username}`,
                    role: "system",
                    level: 999,
                });
            }
            return null;
        }

        if (command === "/unmute" && (user.isAdmin || user.isMod)) {
            const targetUsername = parts[1];
            const target = await ctx.db.query("users").withIndex("username", q => q.eq("username", targetUsername)).first();
            if (target) {
                await ctx.db.patch(target._id, { muteUntil: 0 });
                await ctx.db.insert("communityMessages", {
                    userId,
                    username: "SYSTEM",
                    message: `${target.username} has been unmuted by ${user.username}`,
                    role: "system",
                    level: 999,
                });
            }
            return null;
        }

        if (command === "/ban" && (user.isAdmin || user.isMod)) {
            const targetUsername = parts[1];
            const target = await ctx.db.query("users").withIndex("username", q => q.eq("username", targetUsername)).first();
            if (target) await ctx.db.patch(target._id, { isBanned: true });
            return null;
        }

        if (command === "/tip") {
            // /tip @username amount
            const targetTag = parts[1]; // @username
            const amount = parseFloat(parts[2]);
            if (!targetTag || isNaN(amount) || amount <= 0) return null;
            
            const targetUsername = targetTag.replace("@", "");
            const target = await ctx.db.query("users").withIndex("username", q => q.eq("username", targetUsername)).first();
            
            if (target && target._id !== user._id && (user.balance || 0) >= amount) {
                await ctx.db.patch(user._id, { balance: (user.balance || 0) - amount });
                await ctx.db.patch(target._id, { balance: (target.balance || 0) + amount });
                
                await ctx.db.insert("communityMessages", {
                    userId,
                    username: "SYSTEM",
                    message: `${user.username} tipped ${amount} USD to ${target.username}! 💸`,
                    role: "system",
                    level: 999,
                });

                await ctx.db.insert("notifications", {
                    type: "tip",
                    content: `${user.username?.slice(0,3)}*** tipped ${amount} USD to ${target.username?.slice(0,3)}***!`,
                    isRead: false,
                });
            }
            return null;
        }
    }

    await ctx.db.insert("communityMessages", {
      userId,
      username: user.username || "Anonymous",
      message: args.message,
      role: user.isAdmin ? "admin" : "user",
      level: user.level || 1,
    });
    
    return null;
  },
});

export const tipUser = mutation({
    args: { targetUserId: v.id("users"), amount: v.number() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        
        const user = await ctx.db.get(userId);
        const target = await ctx.db.get(args.targetUserId);
        
        if (!user || !target) throw new Error("User not found");
        if ((user.balance || 0) < args.amount) throw new Error("Insufficient balance");
        if (args.amount <= 0) throw new Error("Invalid amount");

        await ctx.db.patch(user._id, { balance: (user.balance || 0) - args.amount });
        await ctx.db.patch(target._id, { balance: (target.balance || 0) + args.amount });

        await ctx.db.insert("communityMessages", {
            userId: user._id,
            username: "SYSTEM",
            message: `${user.username} tipped ${args.amount} USD to ${target.username}! 💸`,
            role: "system",
            level: 999,
        });

        return null;
    }
});


export const getNotifications = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("notifications"),
    _creationTime: v.number(),
    type: v.string(),
    content: v.string(),
    isRead: v.boolean(),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.any()),
  })),
  handler: async (ctx) => {
    const notifications = await ctx.db.query("notifications").order("desc").take(5).collect();
    return notifications.map(n => ({
        ...n,
        isRead: n.isRead === true,
    }));
  },
});

// Bot functionality
const BOT_USERNAMES = ["SmmKing", "SocialPro", "AdsExpert", "GrowthHacker", "ViralMaster", "SmmReseller", "PanelGod"];
const BOT_MESSAGES = [
    "Just boosted 10k followers for a client! 🔥",
    "Is the API syncing correctly?",
    "Better Social is the best panel I've used so far.",
    "Anyone tried the new TikTok services?",
    "Leveling up feels good! 🚀",
    "Support team answered my ticket in 5 mins, wow.",
    "IG likes are hitting instant today.",
    "Just added $500 via CoinPayments.",
    "Who wants to trade tips?",
    "IRC terminal is where the real talk happens."
];

const BOT_NOTIFICATIONS = [
    "User {user} just ordered 2,500 YouTube Views!",
    "User {user} just added $100.00 via CoinPayments!",
    "User {user} just reached Level {lvl}!",
    "User {user} just redeemed a $25 giftcard!",
    "User {user} just deployed a new IG boost engine!"
];

export const runActivityBot = internalAction({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        // Randomly decide to post a message or a notification
        const isMessage = Math.random() > 0.4;
        const randomName = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)];
        const maskedName = randomName.slice(0, 3) + "***";

        if (isMessage) {
            const randomMsg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
            await ctx.runMutation(internal.chat.addBotMessage, {
                username: randomName,
                message: randomMsg,
                level: Math.floor(Math.random() * 99) + 1
            });
        } else {
            const randomNotif = BOT_NOTIFICATIONS[Math.floor(Math.random() * BOT_NOTIFICATIONS.length)]
                .replace("{user}", maskedName)
                .replace("{lvl}", String(Math.floor(Math.random() * 99) + 1));
            
            await ctx.runMutation(internal.chat.addNotification, {
                content: randomNotif,
                type: "system"
            });
        }
        return null;
    }
});

export const addBotMessage = internalMutation({
    args: { username: v.string(), message: v.string(), level: v.number() },
    returns: v.null(),
    handler: async (ctx, args) => {
        // We need a dummy user ID for the table constraint, or make it optional in schema
        // For now let's just use the first user or a fixed ID if we had one
        const firstUser = await ctx.db.query("users").first();
        if (!firstUser) return null;

        await ctx.db.insert("communityMessages", {
            userId: firstUser._id,
            username: args.username,
            message: args.message,
            role: "user",
            level: args.level,
        });
        return null;
    }
});

export const getDirectMessages = query({
  args: { otherUserId: v.id("users") },
  returns: v.array(v.object({
    _id: v.id("directMessages"),
    _creationTime: v.number(),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isRead: v.boolean(),
  })),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const sent = await ctx.db
      .query("directMessages")
      .withIndex("conversation", (q) => q.eq("senderId", userId).eq("receiverId", args.otherUserId))
      .collect();
      
    const received = await ctx.db
      .query("directMessages")
      .withIndex("conversation", (q) => q.eq("senderId", args.otherUserId).eq("receiverId", userId))
      .collect();
      
    return [...sent, ...received].sort((a, b) => a._creationTime - b._creationTime);
  },
});

export const sendDirectMessage = mutation({
  args: { receiverId: v.id("users"), message: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.insert("directMessages", {
      senderId: userId,
      receiverId: args.receiverId,
      message: args.message,
      isRead: false,
    });
    
    return null;
  },
});

export const getConversations = query({
  args: {},
  returns: v.array(v.object({
    userId: v.id("users"),
    username: v.string(),
    image: v.optional(v.string()),
    lastMessage: v.optional(v.string()),
    lastTime: v.number(),
    unreadCount: v.number(),
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const sent = await ctx.db.query("directMessages").withIndex("by_sender", q => q.eq("senderId", userId)).collect();
    const received = await ctx.db.query("directMessages").withIndex("by_receiver", q => q.eq("receiverId", userId)).collect();
    
    const all = [...sent, ...received];
    const userIds = new Set<string>();
    all.forEach(m => {
        userIds.add(m.senderId === userId ? m.receiverId : m.senderId);
    });
    
    const results = [];
    for (const otherId of userIds) {
        const otherUser = await ctx.db.get(otherId as Id<"users">);
        if (!otherUser) continue;
        
        const conversation = all.filter(m => m.senderId === otherId || m.receiverId === otherId);
        const last = conversation.sort((a,b) => b._creationTime - a._creationTime)[0];
        const unread = conversation.filter(m => m.receiverId === userId && !m.isRead).length;
        
        results.push({
            userId: otherUser._id,
            username: (otherUser as any).username || "Guest",
            image: (otherUser as any).image,
            lastMessage: last.message,
            lastTime: last._creationTime,
            unreadCount: unread,
        });
    }
    
    return results.sort((a,b) => b.lastTime - a.lastTime);
  }
});

export const markDirectMessagesRead = mutation({
    args: { otherUserId: v.id("users") },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        
        const unread = await ctx.db
            .query("directMessages")
            .withIndex("by_receiver_unread", (q) => q.eq("receiverId", userId).eq("isRead", false))
            .collect();
            
        for (const m of unread) {
            if (m.senderId === args.otherUserId) {
                await ctx.db.patch(m._id, { isRead: true });
            }
        }
        return null;
    }
});

export const addNotification = internalMutation({
    args: { content: v.string(), type: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            content: args.content,
            type: args.type,
            isRead: false,
        });
        return null;
    }
});
