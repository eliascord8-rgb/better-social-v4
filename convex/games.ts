import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const COLORS = [
    { name: "grey", multiplier: 1.2, weight: 60, hex: "#334155" },
    { name: "red", multiplier: 1.8, weight: 25, hex: "#ef4444" },
    { name: "blue", multiplier: 4.0, weight: 12, hex: "#3b82f6" },
    { name: "yellow", multiplier: 15.0, weight: 3, hex: "#eab308" },
];

export const playSlots = mutation({
  args: { betAmount: v.number() },
  returns: v.object({
    success: v.boolean(),
    grid: v.array(v.string()),
    winAmount: v.number(),
    message: v.string(),
    jackpotWin: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (args.betAmount < 0.10 || args.betAmount > 100) {
        throw new Error("Bet must be between $0.10 and $100");
    }

    if ((user.balance || 0) < args.betAmount) {
        return { success: false, grid: [], winAmount: 0, message: "Insufficient balance." };
    }

    // Initialize Jackpots if they don't exist
    let jackpots = await ctx.db.query("slotJackpots").collect();
    if (jackpots.length === 0) {
        await ctx.db.insert("slotJackpots", { type: "mini", value: 10 });
        await ctx.db.insert("slotJackpots", { type: "super", value: 40 });
        await ctx.db.insert("slotJackpots", { type: "mega", value: 100 });
        jackpots = await ctx.db.query("slotJackpots").collect();
    }

    // Deduct bet
    await ctx.db.patch(userId, { balance: (user.balance || 0) - args.betAmount });

    // Rakeback calculation: 1% of the bet goes to rakeback
    const rakebackAmount = args.betAmount * 0.01;
    await ctx.db.patch(userId, { 
        rakebackBalance: (user.rakebackBalance || 0) + rakebackAmount 
    });

    // Increase Jackpots by 1% of the bet (0.33% to each)
    for (const jp of jackpots) {
        await ctx.db.patch(jp._id, { value: jp.value + (args.betAmount * 0.0033) });
    }

    // Generate 5x10 grid (50 fields)
    const grid: string[] = [];
    const totalWeight = COLORS.reduce((sum, c) => sum + c.weight, 0);

    const difficultyCap = Math.random() > 0.8 ? 0.5 : 1.0; 

    for (let i = 0; i < 50; i++) {
        let random = Math.random() * totalWeight;
        for (const color of COLORS) {
            if (random < color.weight) {
                grid.push(color.name);
                break;
            }
            random -= color.weight;
        }
    }

    const counts: Record<string, number> = {};
    grid.forEach(c => counts[c] = (counts[c] || 0) + 1);

    let totalWin = 0;
    for (const color of COLORS) {
        const count = counts[color.name] || 0;
        if (count >= 15) { 
            const payout = args.betAmount * color.multiplier * (count / 15) * difficultyCap;
            totalWin += payout;
        }
    }

    // Jackpot Win Chance (Only for $1000+ investors)
    let jackpotWin: string | undefined = undefined;
    if ((user.totalDeposited || 0) >= 1000) {
        const roll = Math.random();
        if (roll < 0.0001) jackpotWin = "mega";
        else if (roll < 0.0005) jackpotWin = "super";
        else if (roll < 0.001) jackpotWin = "mini";


        if (jackpotWin) {
            const jp = jackpots.find(j => j.type === jackpotWin);
            if (jp) {
                totalWin += jp.value;
                const resetValue = jackpotWin === "mini" ? 10 : jackpotWin === "super" ? 40 : 100;
                await ctx.db.patch(jp._id, { value: resetValue });
            }
        }
    }

    if (totalWin > 0) {
        const currentUser = await ctx.db.get(userId);
        await ctx.db.patch(userId, { balance: (currentUser?.balance || 0) + totalWin });

        if (totalWin >= 100) {
            await ctx.db.insert("globalAlerts", {
                type: "jackpot",
                userId,
                username: user.username || "Anonymous",
                amount: totalWin,
                timestamp: Date.now(),
            });

            await ctx.db.insert("notifications", {
                type: "jackpot",
                content: `UNIVERSE SYNC: ${user.username || "Anonymous"} just hit a ${totalWin.toFixed(2)} JACKPOT!`,
                isRead: false,
            });
        }

    }

    return {
        success: true,
        grid,
        winAmount: totalWin,
        message: totalWin > 0 ? `SYNC SUCCESS: $${totalWin.toFixed(2)}` : "SIGNAL LOST",
        jackpotWin: jackpotWin || undefined,
    };
  },
});
