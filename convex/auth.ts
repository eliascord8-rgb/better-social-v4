import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            console.log("Registration profile params:", params);
            const rawEmail = (params.email as string) || (params.identifier as string);
            const email = rawEmail?.toLowerCase().trim();
            const username = (params.username as string)?.trim() || email?.split("@")[0] || "User";
            return {
                email: email,
                username: username,
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
