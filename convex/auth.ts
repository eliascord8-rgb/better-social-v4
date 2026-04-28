import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // Detailed logging (Check your Convex Dashboard logs)
            console.log("REGISTER PARAMS:", JSON.stringify(params));
            
            // 1. EXTRACT EMAIL
            const rawEmail = (params.email || params.identifier) as string;
            if (!rawEmail) throw new Error("Email is required for registration.");
            const email = rawEmail.toLowerCase().trim();
            
            // 2. EXTRACT USERNAME (Crucial fix for your DB visibility issue)
            const username = (params.username as string)?.trim() || email.split("@")[0] || "User";
            
            // 3. EXTRACT BIRTHDAY
            const birthday = (params.birthday as string) || "2000-01-01";

            // 4. RETURN CLEAN OBJECT
            // We save both 'name' and 'username' to ensure it shows up everywhere
            return {
                email,
                username,
                name: username,
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
