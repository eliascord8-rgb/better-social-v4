/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as crons from "../crons.js";
import type * as directMessages from "../directMessages.js";
import type * as friends from "../friends.js";
import type * as games from "../games.js";
import type * as giftcards from "../giftcards.js";
import type * as http from "../http.js";
import type * as liveChat from "../liveChat.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as ordersAction from "../ordersAction.js";
import type * as temp from "../temp.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";
import type * as visitors from "../visitors.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  chat: typeof chat;
  crons: typeof crons;
  directMessages: typeof directMessages;
  friends: typeof friends;
  games: typeof games;
  giftcards: typeof giftcards;
  http: typeof http;
  liveChat: typeof liveChat;
  messages: typeof messages;
  notifications: typeof notifications;
  orders: typeof orders;
  ordersAction: typeof ordersAction;
  temp: typeof temp;
  tickets: typeof tickets;
  users: typeof users;
  visitors: typeof visitors;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
