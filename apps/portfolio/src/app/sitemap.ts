import type { MetadataRoute } from "next"

import { projects } from "@/content/projects"
import { siteUrl } from "@/content/site"
import { localePath, locales } from "@/i18n/config"

const PATHS = [
  "/",
  "/projects",
  ...projects.map((project) => `/projects/${project.slug}`),
  "/experience",
  "/about",
  "/contact",
  "/legal"
]

/** Every page in every language, each listing its translations. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${siteUrl}${localePath(locale, path)}`,
      alternates: {
        languages: Object.fromEntries(
          locales.map((other) => [other, `${siteUrl}${localePath(other, path)}`])
        )
      }
    }))
  )
}
