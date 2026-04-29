import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const updateProfile = mutation({
    args: { username: v.optional(v.string()), image: v.optional(v.string()) },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId) await ctx.db.patch(userId, args);
        return null;
    }
});

export const updateKyc = mutation({
    args: { docType: v.string(), country: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId) await ctx.db.patch(userId, { isKycVerified: true, kycData: args });
        return null;
    }
});

export const getJackpots = query({
    args: {},
    returns: v.array(v.any()),
    handler: async (ctx) => {
        return await ctx.db.query("slotJackpots").collect();
    }
});

export const claimRakeback = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId) await ctx.db.patch(userId, { rakebackBalance: 0, lastRakebackTime: Date.now() });
        return null;
    }
});

export const spinRoulette = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    await ctx.db.patch(userId, { lastRouletteSpin: Date.now() });
    return "Protocol Synchronized";
  },
});

export const redeemGiftcard = mutation({
  args: { code: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const card = await ctx.db
      .query("giftcards")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
    if (!card || card.isUsed) throw new Error("Invalid or used code");
    
    const user = await ctx.db.get(userId);
    let amountToAdd = card.amount || 0;
    
    // Apply 40% bonus for redemptions of $100 or more
    if (amountToAdd >= 100) {
        amountToAdd = amountToAdd * 1.4;
    }

    await ctx.db.patch(userId, { 
        balance: ((user as any)?.balance || 0) + amountToAdd,
        totalDeposited: ((user as any)?.totalDeposited || 0) + (card.amount || 0)
    });
    await ctx.db.patch(card._id, { isUsed: true, usedBy: userId });
    return amountToAdd;
  },
});

export const createCoinPaymentsDeposit = mutation({
  args: { amount: v.number() },
  returns: v.object({ txnId: v.string() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const txnId = "CP_" + Math.random().toString(36).substring(2, 15);
    
    let bonus = 0;
    if (args.amount >= 100) {
        bonus = args.amount * 0.4;
    }

    await ctx.db.insert("deposits", {
        userId,
        amount: args.amount,
        bonus,
        total: args.amount + bonus,
        currency: "USD",
        status: "pending",
        txnId,
        method: "coinpayments",
    });

    return { txnId };
  },
});

export const simulateCompleteDeposit = mutation({
  args: { txnId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const deposit = await ctx.db
        .query("deposits")
        .withIndex("by_txnId", (q) => q.eq("txnId", args.txnId))
        .unique();
    
    if (!deposit) throw new Error("Deposit not found");
    if (deposit.status !== "pending") return null;

    const user = await ctx.db.get(deposit.userId as any);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(deposit._id, { status: "completed" });
    await ctx.db.patch(user._id, {
        balance: ((user as any).balance || 0) + (deposit.total || 0),
        totalDeposited: ((user as any).totalDeposited || 0) + (deposit.amount || 0),
    });

    await ctx.db.insert("communityMessages", {
        userId: user._id,
        username: "SYSTEM",
        message: `Node ${(user as any).username?.slice(0,3)}*** refueled ${(deposit.total || 0).toFixed(2)} USD via Crypto! ⚡`,
        role: "system",
        level: 999,
    });

    return null;
  }
});

export const getMyDeposits = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
        .query("deposits")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .take(5);
  }
});

export const internalCompleteDeposit = internalMutation({
  args: { txnId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const deposit = await ctx.db
        .query("deposits")
        .withIndex("by_txnId", (q) => q.eq("txnId", args.txnId))
        .unique();
    
    if (!deposit) return null;
    if (deposit.status !== "pending") return null;

    const user = await ctx.db.get(deposit.userId as any);
    if (!user) return null;

    await ctx.db.patch(deposit._id, { status: "completed" });
    await ctx.db.patch(user._id, {
        balance: ((user as any).balance || 0) + (deposit.total || 0),
        totalDeposited: ((user as any).totalDeposited || 0) + (deposit.amount || 0),
    });

    await ctx.db.insert("communityMessages", {
        userId: user._id,
        username: "SYSTEM",
        message: `Node ${(user as any).username?.slice(0,3)}*** refueled ${(deposit.total || 0).toFixed(2)} USD via Crypto! ⚡`,
        role: "system",
        level: 999,
    });

    return null;
  }
});

export const sendTip = mutation({
  args: { targetUserId: v.id("users"), amount: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    if (userId === args.targetUserId) throw new Error("Cannot tip yourself");
    if (args.amount <= 0) throw new Error("Invalid amount");

    const sender = await ctx.db.get(userId);
    const receiver = await ctx.db.get(args.targetUserId);

    if (!sender || ((sender as any).balance || 0) < args.amount) {
      throw new Error("Insufficient balance");
    }

    await ctx.db.patch(userId, { balance: ((sender as any).balance || 0) - args.amount });
    await ctx.db.patch(args.targetUserId, { balance: ((receiver as any)?.balance || 0) + args.amount });

    await ctx.db.insert("notifications", {
      userId: args.targetUserId,
      type: "dm",
      content: `${(sender as any).username} sent you a tip of ${args.amount.toFixed(2)}! 💰`,
      isRead: false,
      metadata: { fromId: userId },
    });

    await ctx.db.insert("communityMessages", {
        userId,
        username: "SYSTEM",
        message: `${(sender as any).username} tipped ${(receiver as any)?.username} ${args.amount.toFixed(2)}! 💎`,
        role: "system",
        level: 999,
    });

    return null;
  },
});

export const makeMeAdmin = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId) await ctx.db.patch(userId, { isAdmin: true });
    return null;
  },
});

export const sendFriendRequest = mutation({
  args: { targetUserId: v.id("users") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      await ctx.db.insert("friends", { user1: userId, user2: args.targetUserId, status: "pending" });
    }
    return null;
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const resolveIdentifier = query({
  args: { identifier: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identifier = args.identifier.trim();
    if (!identifier) return "";
    
    if (identifier.includes("@")) return identifier.toLowerCase();
    
    // Search for username in database
    const user = await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", identifier))
      .first() ||
      await ctx.db
      .query("users")
      .withIndex("username", (q) => q.eq("username", identifier.toLowerCase()))
      .first();
      
    // If user found, return their email for authentication
    if (user && (user as any).email) return (user as any).email;
    
    // If no user found, return identifier as-is (might be an email without @)
    return identifier;
  },
});

export const addDeposit = mutation({
  args: { userId: v.id("users"), amount: v.number(), type: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const callerId = await getAuthUserId(ctx);
    const caller = await ctx.db.get(callerId!);
    if (!(caller as any)?.isAdmin) throw new Error("Unauthorized");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    let amountToAdd = args.amount;
    // Apply 40% bonus for deposits of $100 or more
    if (args.amount >= 100) {
        amountToAdd = args.amount * 1.4;
    }

    await ctx.db.patch(args.userId, {
        balance: ((user as any).balance || 0) + amountToAdd,
        totalDeposited: ((user as any).totalDeposited || 0) + args.amount,
    });

    await ctx.db.insert("communityMessages", {
        userId: args.userId,
        username: "SYSTEM",
        message: `Node ${(user as any).username?.slice(0,3)}*** refueled ${amountToAdd.toFixed(2)} USD via ${args.type}! ⚡`,
        role: "system",
        level: 999,
    });

    return null;
  },
});

export const internalApplyWeeklyCashback = internalMutation({
    args: {},
    returns: v.null(),
    handler: async () => {
        return null;
    }
});

export const internalSeedUsernames = internalMutation({
    args: {},
    returns: v.null(),
    handler: async () => {
        return null;
    }
});

export const syncSession = mutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      await ctx.db.patch(userId, { sessionId: args.sessionId });
      
      // Also ensure they are in the userRegistry
      const user = await ctx.db.get(userId);
      if (user) {
        const existing = await ctx.db
            .query("userRegistry")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .first();
        if (!existing) {
            await ctx.db.insert("userRegistry", {
                userId,
                username: (user as any).username || "Guest",
                email: (user as any).email || null,
                registrationTime: Date.now(),
            });
        }
      }
    }
    return null;
  },
});

export const heartbeat = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      await ctx.db.patch(userId, { lastSeen: Date.now() });
    }
    return null;
  },
});

export const getPresence = query({
  args: { userId: v.id("users") },
  returns: v.union(v.null(), v.object({
    isOnline: v.boolean(),
    lastSeen: v.optional(v.number()),
  })),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    const isOnline = !!(user as any).lastSeen && Date.now() - (user as any).lastSeen < 60000; // 1 minute threshold
    return { isOnline, lastSeen: (user as any).lastSeen };
  },
});

export const checkEmailExists = query({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
    return !!user;
  },
});
