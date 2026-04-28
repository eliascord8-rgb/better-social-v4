export default {
  providers: [
    {
      // Universal domain support: Prioritize custom domain, fallback to dynamic env vars
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL || "better-social.pro",
      applicationID: "convex",
    },
  ],
};
