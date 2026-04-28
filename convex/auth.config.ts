export default {
  providers: [
    {
      // Fully flexible domain handshake to support new Netlify sites automatically
      domain: process.env.SITE_URL || process.env.CONVEX_SITE_URL || "better-social.pro",
      applicationID: "convex",
    },
  ],
};
