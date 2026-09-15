import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/authz", "@repo/env", "@repo/logger", "@repo/ui"],
  experimental: {
    useTypeScriptCli: true
  }
}

export default nextConfig
