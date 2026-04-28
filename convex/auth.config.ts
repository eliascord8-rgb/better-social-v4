export default {
  providers: [
    {
      // Automatically clean the domain string to prevent "Server Error Called by client"
      domain: (process.env.SITE_URL || "better-social.pro")
        .replace("https://", "")
        .replace("http://", "")
        .split("/")[0],
      applicationID: "convex",
    },
  ],
};
