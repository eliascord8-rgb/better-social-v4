import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function checkUser() {
    const username = "jhkjsdf88499";
    console.log(`Checking for user: ${username}`);
    const users = await client.query(api.debug.getDebugUsers);
    const user = users.find(u => u.username === username);
    if (user) {
        console.log("User found:", user);
    } else {
        console.log("User NOT found in recent users.");
        console.log("Recent users:", users.map(u => u.username));
    }
}

checkUser();
