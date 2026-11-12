import type { MetadataRoute } from "next";
import { APP_NAME } from "@/lib/config";

// Lets creators add GettingDM to their phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: "Instagram comment-to-DM automation",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#E9E8F8",
    theme_color: "#E9E8F8",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
