import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // Log everything for one last check in Convex dashboard
            console.log("INTERNAL_AUTH_PARAMS:", JSON.stringify(params));
            
            // 1. EXTRACT EMAIL (Primary ID)
            const rawEmail = (params.email || params.identifier) as string;
            if (!rawEmail) throw new Error("Email required.");
            const email = rawEmail.toLowerCase().trim();
            
            // 2. EXTRACT USERNAME (Rename support)
            // We look for 'username' or any other field that might hold the ID
            const rawUsername = (params.username || params.name || params.preferred_username) as string;
            const username = (rawUsername || email.split("@")[0] || "Node_User").trim();
            
            const birthday = (params.birthday as string) || "2000-01-01";

            // 3. FORCE SAVE TO ALL IDENTITY FIELDS
            return {
                email,
                username,
                name: username, // Important: Save to 'name' as well for redundancy
                birthday,
                balance: 0,
                level: 1,
                exp: 0,
                totalDeposited: 0,
                isKycVerified: false,
                rakebackBalance: 0,
                lastRakebackTime: Date.now(),
            };
        },
    }),
  ],
});
