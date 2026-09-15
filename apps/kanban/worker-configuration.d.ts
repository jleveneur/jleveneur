interface CloudflareBindings {
  DB: D1Database
  ATTACHMENTS: R2Bucket
  BOARD_ROOM: DurableObjectNamespace
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  LOG_LEVEL?: string
  AUTH_RATE_LIMIT?: string
}

declare namespace Cloudflare {
  type Env = CloudflareBindings
}

declare module "cloudflare:workers" {
  export const env: Cloudflare.Env
}
