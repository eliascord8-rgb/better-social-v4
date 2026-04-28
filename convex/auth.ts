import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            // The most resilient identifier extraction possible
            const email = ((params.email || params.identifier || params.emailAddress) as string).toLowerCase().trim();
            const username = ((params.username || params.name) as string || email.split("@")[0]).trim();
            
            return {
                email,
                username,
                name: username,
                birthday: (params.birthday as string) || "2000-01-01",
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
