# syntax=docker/dockerfile:1.7

FROM node:24-alpine AS base
WORKDIR /app

FROM base AS pruner
RUN npm install -g turbo
COPY . .
RUN turbo prune portfolio --docker

FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app .
COPY --from=pruner /app/out/full/ .
RUN npm run build --workspace=apps/portfolio

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder --chown=nextjs:nextjs /app/apps/portfolio/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/portfolio/.next/static ./apps/portfolio/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/portfolio/server.js"]