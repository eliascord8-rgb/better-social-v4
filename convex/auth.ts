import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // Find the unique identifier (email)
            const identifier = (params.email || params.identifier) as string;
            if (!identifier) {
                throw new Error("Registration failed: No email provided.");
            }
            
            const email = identifier.toLowerCase().trim();
            
            // Find the chosen username, fallback to email prefix if missing
            const username = (params.username as string)?.trim() || email.split("@")[0] || "User";
            const birthday = (params.birthday as string) || "2000-01-01";

            // We MUST return these fields exactly for Convex Auth to save them
            return {
                email,
                username,
                name: username, // Saving to both fields for total compatibility
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
