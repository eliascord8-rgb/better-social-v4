import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getCategories = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    const categories = Array.from(new Set(services.map((s) => s.category)));
    return categories.sort();
  },
});

export const getServicesByCategory = query({
  args: { category: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      externalId: v.string(),
      name: v.string(),
      category: v.string(),
      rate: v.string(),
      min: v.string(),
      max: v.string(),
      type: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const submitOrder = mutation({
  args: {
    serviceId: v.id("services"),
    quantity: v.number(),
    link: v.string(),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    // Basic validation
    if (args.quantity < Number(service.min) || args.quantity > Number(service.max)) {
        throw new Error(`Quantity must be between ${service.min} and ${service.max}`);
    }

    const cost = (Number(service.rate) / 1000) * args.quantity;

    // Check and deduct balance
    const user = await ctx.db.get(userId);
    const balance = (user as any)?.balance || 0;
    if (balance < cost) {
        throw new Error(`Insufficient balance. Cost: ${cost.toFixed(2)}, Balance: ${balance.toFixed(2)}`);
    }
    
    const rakeback = cost * 0.01;
    await ctx.db.patch(userId, { 
        balance: balance - cost,
        rakebackBalance: ((user as any)?.rakebackBalance || 0) + rakeback,
    });

    const orderId = await ctx.db.insert("orders", {
      userId,
      serviceId: args.serviceId,
      quantity: args.quantity,
      link: args.link,
      status: "pending",
      cost,
    });

    const maskedName = (user as any)?.username ? (user as any).username.slice(0, 3) + "***" : "Ano***";
    await ctx.db.insert("notifications", {
        userId,
        type: "order",
        content: `User ${maskedName} just ordered ${args.quantity.toLocaleString()} ${service.name}!`,
        isRead: false,
    });

    // Schedule the external API call
    await ctx.scheduler.runAfter(0, internal.ordersAction.processExternalOrder, {
        orderId
    });

    return orderId;
  },
});

export const getMyOrders = query({
    args: {},
    returns: v.array(v.any()),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        
        const orders = await ctx.db
            .query("orders")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
            
        const results = [];
        for (const order of orders) {
            let serviceName = "Unknown Service";
            if (order.serviceId) {
                try {
                    const service = await ctx.db.get(order.serviceId);
                    if (service) serviceName = service.name;
                } catch (e) {
                    // Ignore invalid IDs
                }
            }
            results.push({
                ...order,
                serviceName,
            });
        }
        return results;
    }
})
