import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            console.log("Password profile params:", JSON.stringify(params));
            // The most resilient identifier extraction possible
            const emailValue = params.email || params.identifier || params.emailAddress || "";
            const email = (typeof emailValue === "string" ? emailValue : "").toLowerCase().trim();
            
            const usernameValue = params.username || params.name || "";
            const username = (typeof usernameValue === "string" && usernameValue.length > 0 
                ? usernameValue 
                : email.split("@")[0] || "user_" + Math.random().toString(36).substring(7)).trim();
            
            const profile: any = {
                username,
                name: username,
                balance: 0, // Starting balance
                level: 1,
                exp: 0,
                totalDeposited: 0,
                isKycVerified: false,
                rakebackBalance: 0,
                lastRakebackTime: Date.now(),
                email,
            };
            console.log("Constructed profile for DB insertion:", JSON.stringify(profile));
            return profile;
        },
    }),
  ],
});
