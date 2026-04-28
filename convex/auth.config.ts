export default {
  providers: [
    {
      // Support both custom domain and Netlify domain for the security handshake
      domain: (process.env.SITE_URL || process.env.CONVEX_SITE_URL || "better-social.pro")
        .replace("https://", "")
        .replace("http://", "")
        .split("/")[0],
      applicationID: "convex",
    },
  ],
};
