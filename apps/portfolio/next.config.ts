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

const nextConfig: NextConfig = {
  // Static HTML for Cloudflare Workers assets. `next build` writes `out/`.
  // Response headers live in `public/_headers` (copied into `out/`) because
  // `headers()` in this file is ignored for a static export.
  output: "export",

  experimental: {
    // TypeScript 7 has no JavaScript compiler API yet, so `next build` shells
    // out to the local `tsc` instead of loading it in-process.
    useTypeScriptCli: true
  }
}

export default nextConfig
