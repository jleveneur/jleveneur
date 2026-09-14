import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

import type { NextConfig } from "next"

// The workspace keeps one `.env` at the repository root, and Next only looks
// inside the app directory. Node reads the file natively; in CI and production
// the variables are already set, so it is absent and this is a no-op.
const rootEnv = fileURLToPath(new URL("../../.env", import.meta.url))
if (existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv)
}

/**
 * Response headers applied to every route.
 *
 * The `Content-Security-Policy` here is deliberately partial. `frame-ancestors`,
 * `base-uri`, and `object-src` are the directives that need no knowledge of the
 * page, so they can ship in a starter. A `script-src` worth having requires a
 * per-request nonce threaded through the app, and one written without that
 * either breaks Next's inline bootstrap or is loose enough to be decorative.
 *
 * Next.js warns these headers are not applied when serving the `out/` export.
 * vinext still applies them on the Worker Workers Builds deploys.
 */
const SECURITY_HEADERS = [
  // Browsers ignore this over plain HTTP, so it costs nothing locally.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    key: "Content-Security-Policy",
    value: ["frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'"].join("; ")
  }
]

const nextConfig: NextConfig = {
  // The public site is static HTML. `output: "export"` is the Next/vinext
  // switch for that: vinext prerenders routes into `dist/client`, and
  // `next build` writes `out/`.
  //
  // Workers Builds still deploys a Worker (`dist/server/wrangler.json`, name
  // `jleveneur`). vinext's assets-only example puts wrangler outside the app
  // root and would change the dashboard deploy command; this keeps Connect Git
  // as already configured.
  output: "export",

  headers() {
    return Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }])
  },

  experimental: {
    // TypeScript 7 has no JavaScript compiler API yet, so `next build` shells
    // out to the local `tsc` instead of loading it in-process.
    useTypeScriptCli: true
  }
}

export default nextConfig
