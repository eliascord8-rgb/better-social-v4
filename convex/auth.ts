import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // Log for debugging (visible in Convex dashboard)
            console.log("Auth params keys:", Object.keys(params));
            
            // Try to find email in any possible field
            const emailField = (params.email || params.identifier || params.emailAddress) as string;
            if (!emailField) {
                throw new Error("Registration failed: No email provided in request.");
            }
            
            const email = emailField.toLowerCase().trim();
            
            // Try to find username, otherwise fallback to part of email
            const username = (params.username as string)?.trim() || email.split("@")[0] || "User";
            const birthday = (params.birthday as string) || "2000-01-01";

            return {
                email,
                username,
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
