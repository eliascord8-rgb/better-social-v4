import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    isAdmin: v.optional(v.boolean()),
    isMod: v.optional(v.boolean()),
    isMuted: v.optional(v.boolean()),
    isBanned: v.optional(v.boolean()),
    birthday: v.optional(v.string()), // YYYY-MM-DD
    balance: v.optional(v.number()), // Account balance in USD
    level: v.optional(v.number()), // User level
    exp: v.optional(v.number()), // Experience points
    apiKey: v.optional(v.string()), // For user API access
    lastCashbackTime: v.optional(v.number()),
    lastRakebackTime: v.optional(v.number()),
    rakebackBalance: v.optional(v.number()),
    hasDepositedBefore: v.optional(v.boolean()),
    totalDeposited: v.optional(v.number()),
    isKycVerified: v.optional(v.boolean()),
    sessionId: v.optional(v.union(v.string(), v.null())), // For real-time kick
    directAlert: v.optional(v.union(v.string(), v.null())), // For real-time popup messages
    kycData: v.optional(v.object({
      docType: v.string(),
      country: v.string(),
    })),
    lastRouletteSpin: v.optional(v.number()),
    muteUntil: v.optional(v.number()), // Timestamp for mute expiration
    lastSeen: v.optional(v.number()), // Timestamp for presence tracking
  })
    .index("email", ["email"])
    .index("username", ["username"]),

  slotJackpots: defineTable({
    type: v.string(), // mini, super, mega
    value: v.number(),
  }),

  globalAlerts: defineTable({
    type: v.string(), // jackpot
    userId: v.id("users"),
    username: v.string(),
    amount: v.number(),
    timestamp: v.number(),
  }),


  apiSettings: defineTable({
    apiUrl: v.string(),
    apiKey: v.string(),
  }),

  services: defineTable({
    externalId: v.string(),
    name: v.string(),
    category: v.string(),
    rate: v.string(),
    min: v.string(),
    max: v.string(),
    type: v.string(),
    description: v.optional(v.string()),
  }).index("by_category", ["category"]),

  orders: defineTable({
    userId: v.id("users"),
    serviceId: v.id("services"),
    externalOrderId: v.optional(v.string()),
    quantity: v.number(),
    link: v.string(),
    status: v.string(), // pending, processing, completed, error
    cost: v.number(),
    errorMessage: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  giftcards: defineTable({
    code: v.string(),
    amount: v.number(),
    isUsed: v.boolean(),
    usedBy: v.optional(v.id("users")),
  }).index("by_code", ["code"]),

  tickets: defineTable({
    userId: v.id("users"),
    subject: v.string(),
    status: v.string(), // open, pending, closed
    lastUpdate: v.number(),
    hasUnreadAdminReply: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  ticketMessages: defineTable({
    ticketId: v.id("tickets"),
    senderId: v.id("users"),
    message: v.string(),
    isAdmin: v.boolean(),
  }).index("by_ticket", ["ticketId"]),

  liveChatSessions: defineTable({
    guestId: v.string(), // unique ID for non-logged users
    userId: v.optional(v.id("users")),
    operatorName: v.optional(v.string()),
    status: v.string(), // active, closed
    hasUnreadAdminReply: v.optional(v.boolean()),
  }).index("by_guestId", ["guestId"]),

  liveChatMessages: defineTable({
    sessionId: v.id("liveChatSessions"),
    senderName: v.string(),
    message: v.string(),
    isAdmin: v.boolean(),
  }).index("by_session", ["sessionId"]),

  directMessages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.optional(v.string()),
    audioUrl: v.optional(v.string()), // URL from Convex storage
    imageUrl: v.optional(v.string()),
    isRead: v.boolean(),
  })
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_receiver_unread", ["receiverId", "isRead"])
    .index("conversation", ["senderId", "receiverId"]),

  communityMessages: defineTable({
    userId: v.id("users"),
    username: v.string(),
    message: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    role: v.string(), // admin, mod, user
    level: v.number(),
  }),

  notifications: defineTable({
    userId: v.optional(v.id("users")),
    type: v.string(), // login, order, dm, friend_request, friend_accept
    content: v.string(),
    isRead: v.optional(v.boolean()),
    metadata: v.optional(v.any()),
  }).index("by_user", ["userId"]),

  friends: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    status: v.string(), // pending, accepted
  }).index("by_user1", ["user1"])
    .index("by_user2", ["user2"])
    .index("by_users", ["user1", "user2"]),

  systemSettings: defineTable({
    key: v.string(), // maintenance_mode
    value: v.any(),
  }).index("by_key", ["key"]),

  visitorPopupStatus: defineTable({
    ip: v.string(),
    hasSeenBonus: v.boolean(),
  }).index("by_ip", ["ip"]),

  deposits: defineTable({
    userId: v.id("users"),
    amount: v.number(), // The base amount
    bonus: v.number(),  // The 40% bonus amount
    total: v.number(),  // amount + bonus
    currency: v.string(),
    status: v.string(), // pending, completed, cancelled
    txnId: v.optional(v.string()), // CoinPayments txn ID
    method: v.string(), // coinpayments, giftcard
  }).index("by_user", ["userId"])
    .index("by_txnId", ["txnId"]),
});
