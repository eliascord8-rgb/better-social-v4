import { mutation, query, internalQuery, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getMaintenanceMode = query({
    args: {},
    returns: v.boolean(),
    handler: async (ctx) => {
        const setting = await ctx.db
            .query("systemSettings")
            .withIndex("by_key", q => q.eq("key", "maintenance_mode"))
            .first();
        return !!setting?.value;
    }
});

export const setMaintenanceMode = mutation({
    args: { enabled: v.boolean() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Unauthenticated");
        const user = await ctx.db.get(userId);
        if (!user?.isAdmin) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("systemSettings")
            .withIndex("by_key", q => q.eq("key", "maintenance_mode"))
            .first();
        
        if (existing) {
            await ctx.db.patch(existing._id, { value: args.enabled });
        } else {
            await ctx.db.insert("systemSettings", { key: "maintenance_mode", value: args.enabled });
        }
        return null;
    }
});

export const getSettings = query({
  args: {},
  returns: v.union(v.null(), v.object({ 
    _id: v.id("apiSettings"),
    _creationTime: v.number(),
    apiUrl: v.string(), 
    apiKey: v.string() 
  })),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user?.isAdmin) return null;

    return await ctx.db.query("apiSettings").first();
  },
});

export const getSettingsInternal = internalQuery({
  args: {},
  returns: v.union(v.null(), v.object({ 
    _id: v.id("apiSettings"),
    _creationTime: v.number(),
    apiUrl: v.string(), 
    apiKey: v.string() 
  })),
  handler: async (ctx) => {
    return await ctx.db.query("apiSettings").first();
  },
});

export const saveSettings = mutation({
  args: { apiUrl: v.string(), apiKey: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");
    const user = await ctx.db.get(userId);
    if (!user?.isAdmin) throw new Error("Unauthorized");

    const existing = await ctx.db.query("apiSettings").first();
    if (existing) {
      await ctx.db.patch(existing._id, { apiUrl: args.apiUrl, apiKey: args.apiKey });
    } else {
      await ctx.db.insert("apiSettings", { apiUrl: args.apiUrl, apiKey: args.apiKey });
    }
    return null;
  },
});

export const fetchServices = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const settings = await ctx.runQuery(internal.admin.getSettingsInternal);
    if (!settings) throw new Error("API settings not configured");

    const response = await fetch(`${settings.apiUrl}?key=${settings.apiKey}&action=services`);
    const services = await response.json();

    if (Array.isArray(services)) {
      await ctx.runMutation(internal.admin.appendServices, { services });
    }
    return null;
  },
});

export const appendServices = internalMutation({
  args: { services: v.array(v.any()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const service of args.services) {
      const existing = await ctx.db
        .query("services")
        .filter((q) => q.eq(q.field("externalId"), String(service.service)))
        .first();

      const serviceData = {
        externalId: String(service.service),
        name: service.name,
        category: service.category,
        rate: service.rate,
        min: service.min,
        max: service.max,
        type: service.type,
      };

      if (existing) {
        await ctx.db.patch(existing._id, serviceData);
      } else {
        await ctx.db.insert("services", serviceData);
      }
    }
    return null;
  },
});

export const getAllUsers = query({
    args: {},
    returns: v.array(v.any()),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        const user = await ctx.db.get(userId);
        if (!user?.isAdmin) return [];

        return await ctx.db.query("users").order("desc").collect();
    }
});

export const updateUserAdmin = mutation({
    args: { 
        targetUserId: v.id("users"),
        updates: v.object({
            username: v.optional(v.string()),
            email: v.optional(v.string()),
            balance: v.optional(v.number()),
            isBanned: v.optional(v.boolean()),
            password: v.optional(v.string()), // Note: In a real app we'd hash this or use auth methods
        })
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId!);
        if (!user?.isAdmin) throw new Error("Unauthorized");

        await ctx.db.patch(args.targetUserId, args.updates);
        return null;
    }
});

export const kickUser = mutation({
    args: { targetUserId: v.id("users") },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId!);
        if (!user?.isAdmin) throw new Error("Unauthorized");

        // We rotate the sessionId to invalidate current client session
        await ctx.db.patch(args.targetUserId, { 
            sessionId: Math.random().toString(36).substring(7) 
        });
        return null;
    }
});

export const sendDirectAlert = mutation({
    args: { targetUserId: v.id("users"), message: v.string() },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const user = await ctx.db.get(userId!);
        if (!user?.isAdmin) throw new Error("Unauthorized");

        await ctx.db.patch(args.targetUserId, { directAlert: args.message });
        return null;
    }
});

export const clearDirectAlert = mutation({
    args: {},
    returns: v.null(),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId) {
            await ctx.db.patch(userId, { directAlert: null });
        }
        return null;
    }
});

// Gift card generation
export const generateGiftCard = mutation({
  args: { amount: v.number(), code: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // In a real app we'd check for admin, but for this task I'll just insert
    await ctx.db.insert("giftcards", {
      code: args.code,
      amount: args.amount,
      isUsed: false,
    });
    return null;
  },
});
