export default {
  providers: [
    {
      // This setting allows the authentication to work on BOTH domains automatically
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL || "better-social.pro",
      applicationID: "convex",
    },
  ],
};
