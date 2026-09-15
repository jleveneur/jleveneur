import { cloudflare } from "@cloudflare/vite-plugin"
import vinext from "vinext"
import { defineConfig } from "vite"

/**
 * Cloudflare Workers build for the public site.
 *
 * vinext shims `next/*` on Vite. It auto-registers `@vitejs/plugin-rsc` when
 * `src/app` is present — adding `rsc()` here fails the build with a duplicate
 * plugin error. `cloudflare()` must run the RSC environment in workerd with
 * SSR as a child, or the Worker bundle loses the client/server boundary.
 *
 * Image optimization is off: this app has no `next/image` usage, and the
 * default `imagesOptimizer()` helper is not type-clean under
 * `exactOptionalPropertyTypes`.
 */
export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"]
      }
    })
  ]
})
