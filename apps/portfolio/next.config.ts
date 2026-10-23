import type { NextConfig } from "next"

/**
 * Response headers applied to every route.
 *
 * The `Content-Security-Policy` here is deliberately partial. `frame-ancestors`,
 * `base-uri`, and `object-src` are the directives that need no knowledge of the
 * page, so they can ship in a starter. A `script-src` worth having requires a
 * per-request nonce threaded through the app, and one written without that
 * either breaks Next's inline bootstrap or is loose enough to be decorative.
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

// `next start` cannot serve `output: "export"`. `build:export` sets this so
// `next build` writes `out/`, which Caddy serves on the VPS.
const staticExport = process.env["PORTFOLIO_EXPORT"] === "1"

const nextConfig: NextConfig = {
  ...(staticExport ? { output: "export" as const } : {}),

  // A static export ignores `headers()` here; Caddy sends the same headers
  // (`deploy/caddy/jleveneur.caddy`).
  ...(!staticExport
    ? {
        headers() {
          return Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }])
        }
      }
    : {}),

  experimental: {
    // TypeScript 7 has no JavaScript compiler API yet, so `next build` shells
    // out to the local `tsc` instead of loading it in-process.
    useTypeScriptCli: true
  }
}

export default nextConfig
