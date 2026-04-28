import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generate = mutation({
  args: { amount: v.number(), code: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("giftcards", {
      code: args.code,
      amount: args.amount,
      isUsed: false,
    });
    return null;
  },
});
