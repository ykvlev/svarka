import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: `${siteUrl()}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
