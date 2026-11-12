import type { MetadataRoute } from "next";
import { APP_DOMAIN } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${APP_DOMAIN}`;
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/register`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/data-deletion`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
