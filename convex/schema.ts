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
    directAlert: v.optional(v.union(v.string(), v.null())),
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
  directMessages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isRead: v.boolean(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_receiver_unread", ["receiverId", "isRead"])
    .index("conversation", ["senderId", "receiverId"]),
  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    status: v.string(),
  })
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"])
    .index("by_users", ["user1", "user2"]),
  notifications: defineTable(v.any()).index("by_user", ["userId"]),
  giftcards: defineTable(v.any()).index("by_code", ["code"]),
  tickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    status: v.string(),
    lastUpdate: v.number(),
    hasUnreadAdminReply: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
  ticketMessages: defineTable({
    ticketId: v.id("tickets"),
    senderId: v.id("users"),
    message: v.string(),
    isAdmin: v.boolean(),
  }).index("by_ticket", ["ticketId"]),
  maintenance: defineTable(v.any()),
  liveChat: defineTable(v.any()).index("by_guest", ["guestId"]),
  liveChatSessions: defineTable({
    guestId: v.string(),
    status: v.string(),
    userId: v.optional(v.id("users")),
    operatorName: v.optional(v.string()),
    lastMessage: v.optional(v.string()),
    hasUnreadAdminReply: v.optional(v.boolean()),
  }).index("by_guestId", ["guestId"]),
  liveChatMessages: defineTable({
    sessionId: v.id("liveChatSessions"),
    senderName: v.string(),
    message: v.string(),
    isAdmin: v.boolean(),
  }).index("by_session", ["sessionId"]),
  orders: defineTable({
    userId: v.id("users"),
    serviceId: v.id("services"),
    quantity: v.number(),
    link: v.string(),
    status: v.string(),
    cost: v.number(),
    externalOrderId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  }).index("by_user", ["userId"]),
  dailyBonuses: defineTable(v.any()).index("by_ip", ["ip"]),
  deposits: defineTable(v.any()).index("by_user", ["userId"]).index("by_txnId", ["txnId"]),
  userRegistry: defineTable({
    userId: v.id("users"),
    username: v.string(),
    email: v.union(v.string(), v.null()),
    registrationTime: v.number(),
  }).index("by_username", ["username"]).index("by_userId", ["userId"]),
  systemSettings: defineTable(v.any()).index("by_key", ["key"]),
  apiSettings: defineTable(v.any()),
  services: defineTable({
    externalId: v.string(),
    name: v.string(),
    category: v.string(),
    rate: v.string(),
    min: v.string(),
    max: v.string(),
    type: v.string(),
  }).index("by_category", ["category"]),
  visitorPopupStatus: defineTable(v.any()).index("by_ip", ["ip"]),
});
