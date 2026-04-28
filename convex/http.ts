import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/coinpayments-ipn",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const status = parseInt(params.get("status") || "0");
    const txnId = params.get("txn_id");
    
    // CoinPayments statuses: 100+ is success, < 0 is error
    if (status >= 100 && txnId) {
        await ctx.runMutation(internal.users.internalCompleteDeposit, { txnId });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
