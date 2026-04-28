export default {
  providers: [
    {
      // Using a dynamic domain check to support both .pro and .netlify.app
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL || "better-social.pro",
      applicationID: "convex",
    },
  ],
};
