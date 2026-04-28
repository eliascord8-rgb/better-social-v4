import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            const rawEmail = (params.email || params.identifier || params.emailAddress) as string;
            if (!rawEmail) throw new Error("Email required.");
            const email = rawEmail.toLowerCase().trim();
            
            const rawUsername = (params.username || params.name || params.preferred_username) as string;
            const username = (rawUsername || email.split("@")[0] || "User").trim();
            
            const birthday = (params.birthday as string) || "2000-01-01";

            return {
                email,
                username,
                name: username,
                preferred_username: username, // Added for extra search compatibility
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
