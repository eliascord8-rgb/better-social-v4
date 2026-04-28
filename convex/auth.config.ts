export default {
  providers: [
    {
      // Reverting to the system default is required for the JWT handshake to work
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
