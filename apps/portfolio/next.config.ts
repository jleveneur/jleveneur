import { fileURLToPath } from "node:url"

import type { NextConfig } from "next"

// The repository root, where tracing starts.
const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url))

/**
 * Response headers applied to every route.
 *
 * The `Content-Security-Policy` here is deliberately partial. `frame-ancestors`,
 * `base-uri`, and `object-src` are the directives that need no knowledge of the
 * page, so they can ship as static headers. A `script-src` worth having requires
 * a per-request nonce threaded through the app, and one written without that
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

const nextConfig: NextConfig = {
  // The Docker image (`Dockerfile` beside this file) runs `server.js` from a
  // self-contained build holding only the files the server traces. Tracing
  // starts at the repository root, where the workspace's packages are.
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,

  // Caddy compresses every response, in zstd where the browser takes it. Next
  // would gzip first, and Caddy passes an encoded response through untouched.
  compress: false,

  headers() {
    return Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }])
  },

  experimental: {
    // TypeScript 7 has no JavaScript compiler API yet, so `next build` shells
    // out to the local `tsc` instead of loading it in-process.
    useTypeScriptCli: true,
    // Every page lives under `[locale]`, so a URL the proxy does not handle
    // (a stray file path) has no layout to render it in.
    // `app/global-not-found.tsx` answers it in the default locale.
    globalNotFound: true
  }
}

export default nextConfig
