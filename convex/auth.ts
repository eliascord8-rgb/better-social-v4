import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
        profile(params) {
            console.log("Registration attempt params keys:", Object.keys(params));
            
            try {
                const rawEmail = (params.email as string) || (params.identifier as string);
                if (!rawEmail) {
                    throw new Error("Missing email or identifier in registration params");
                }
                
                const email = rawEmail.toLowerCase().trim();
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
            } catch (err) {
                console.error("Error in auth profile mapping:", err);
                throw err;
            }
        },
    }),
  ],
});
