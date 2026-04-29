import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Fresh schema for the new project
  publicTransmissions: defineTable({
    content: v.string(),
    timestamp: v.number(),
  }),
});
