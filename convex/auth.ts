import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // Find Email (be extremely aggressive)
            const rawEmail = (params.email || params.identifier || params.emailAddress || params.Email) as string;
            
            // Safety fallback if email is somehow missing
            if (!rawEmail) {
                throw new Error("DATA_SYNC_ERROR: No email found in network transmission.");
            }
            
            const email = rawEmail.toLowerCase().trim();
            
            // Find Username
            const rawUsername = (params.username || params.Username || params.name || params.Name) as string;
            const username = (rawUsername || email.split("@")[0] || "Network_Node").trim();
            
            const birthday = (params.birthday as string) || "2000-01-01";

            // Return clean profile to database
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
