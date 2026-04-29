import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields,
    username: v.optional(v.string()),
    birthday: v.optional(v.string()),
    balance: v.optional(v.number()),
    level: v.optional(v.number()),
    exp: v.optional(v.number()),
    apiKey: v.optional(v.string()),
    lastCashbackTime: v.optional(v.number()),
    lastRakebackTime: v.optional(v.number()),
    rakebackBalance: v.optional(v.number()),
    hasDepositedBefore: v.optional(v.boolean()),
    totalDeposited: v.optional(v.number()),
    isKycVerified: v.optional(v.boolean()),
    sessionId: v.optional(v.string()),
    directAlert: v.optional(v.string()),
    kycData: v.optional(v.any()),
    lastRouletteSpin: v.optional(v.number()),
    muteUntil: v.optional(v.number()),
    lastSeen: v.optional(v.number()),
    ip: v.optional(v.string()),
    hasSeenBonus: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    isMod: v.optional(v.boolean()),
    isMuted: v.optional(v.boolean()),
    isBanned: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("username", ["username"]),

  slotJackpots: defineTable(v.any()),
  globalAlerts: defineTable(v.any()),
  communityMessages: defineTable(v.any()),
  directMessages: defineTable(v.any())
    .index("by_users", ["senderId", "receiverId"])
    .index("by_receiver", ["receiverId"]),
  friends: defineTable(v.any())
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),
  notifications: defineTable(v.any()).index("by_user", ["userId"]),
  giftcards: defineTable(v.any()).index("by_code", ["code"]),
  tickets: defineTable(v.any()).index("by_user", ["userId"]),
  ticketMessages: defineTable(v.any()).index("by_ticket", ["ticketId"]),
  maintenance: defineTable(v.any()),
  liveChat: defineTable(v.any()).index("by_guest", ["guestId"]),
  liveChatSessions: defineTable(v.any()).index("by_guestId", ["guestId"]),
  liveChatMessages: defineTable(v.any()).index("by_session", ["sessionId"]),
  orders: defineTable(v.any()).index("by_user", ["userId"]),
  dailyBonuses: defineTable(v.any()).index("by_ip", ["ip"]),
  deposits: defineTable(v.any()).index("by_user", ["userId"]).index("by_txnId", ["txnId"]),
  userRegistry: defineTable(v.any()).index("by_username", ["username"]).index("by_userId", ["userId"]),
  systemSettings: defineTable(v.any()).index("by_key", ["key"]),
  apiSettings: defineTable(v.any()),
  services: defineTable(v.any()).index("by_category", ["category"]),
  visitorPopupStatus: defineTable(v.any()).index("by_ip", ["ip"]),
});
