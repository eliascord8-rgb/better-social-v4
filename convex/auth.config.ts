export default {
  providers: [
    {
      // Use the custom SITE_URL you added to the Convex dashboard
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
