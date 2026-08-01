const rawSiteUrl =
  process.env.PUBLIC_SITE_URL ||
  process.env.VITE_PUBLIC_SITE_URL ||
  process.env.URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:5173";

const withProtocol = rawSiteUrl.startsWith("http") ? rawSiteUrl : `https://${rawSiteUrl}`;

export const PUBLIC_SITE_URL = withProtocol.replace(/\/$/, "");
