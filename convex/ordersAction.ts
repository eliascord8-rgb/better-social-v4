import { internalAction, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const processExternalOrder = internalAction({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 1. Get order details
    const order = await ctx.runQuery(internal.ordersAction.getOrderForProcessing, { orderId: args.orderId });
    if (!order) return null;

    // 2. Get API settings
    const settings = await ctx.runQuery(internal.admin.getSettingsInternal);
    if (!settings) {
        await ctx.runMutation(internal.ordersAction.updateOrderStatus, { 
            orderId: args.orderId, 
            status: "error", 
            errorMessage: "API settings not configured" 
        });
        return null;
    }

    // 3. Call external API
    try {
        const url = `${settings.apiUrl}?key=${settings.apiKey}&action=add&service=${order.serviceExternalId}&link=${encodeURIComponent(order.link)}&quantity=${order.quantity}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.order) {
            // Success
            await ctx.runMutation(internal.ordersAction.updateOrderStatus, { 
                orderId: args.orderId, 
                status: "processing", 
                externalOrderId: String(data.order) 
            });
        } else if (data.error) {
            // API Error
            await ctx.runMutation(internal.ordersAction.updateOrderStatus, { 
                orderId: args.orderId, 
                status: "error", 
                errorMessage: data.error 
            });
        } else {
            throw new Error("Unknown response from API");
        }
    } catch (err: any) {
        await ctx.runMutation(internal.ordersAction.updateOrderStatus, { 
            orderId: args.orderId, 
            status: "error", 
            errorMessage: err.message 
        });
    }

    return null;
  },
});

export const getOrderForProcessing = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const service = await ctx.db.get(order.serviceId);
    return {
        ...order,
        serviceExternalId: service?.externalId
    };
  },
});

export const updateOrderStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    externalOrderId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      externalOrderId: args.externalOrderId,
      errorMessage: args.errorMessage,
    });
    return null;
  },
});
