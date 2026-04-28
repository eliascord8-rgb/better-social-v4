export default {
  providers: [
    {
      // Use SITE_URL (the frontend domain) if set, fallback to system default
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
