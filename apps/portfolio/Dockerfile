# syntax=docker/dockerfile:1

# The portfolio's production image, built from the repository root:
#
#   docker build -f apps/portfolio/Dockerfile -t jleveneur-portfolio .
#
# The images workflow (`.github/workflows/images.yml`) builds it and publishes
# it to GHCR, and `deploy/portfolio/compose.yml` runs it on the VPS. It works
# from a `turbo prune` of the workspace, so it only installs and copies what
# the portfolio depends on, and a change elsewhere in the monorepo does not
# invalidate its layers. `Dockerfile.dockerignore` beside it keeps the host's
# dependencies, build output and `.env` files out of the build context.

ARG BUN_VERSION=1.4.4

# Bun installs the packages, builds, and serves, as in CI. No Node anywhere.
FROM oven/bun:${BUN_VERSION} AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1 \
    DO_NOT_TRACK=1
WORKDIR /repo

# `out/json` holds the manifests and the pruned lockfile, `out/full` the
# sources. Installing from the manifests alone keeps the dependency layer
# cached until a package.json or bun.lock changes.
FROM base AS prune
COPY . .
RUN bun x "turbo@$(bun -p 'require("./package.json").devDependencies.turbo')" prune @repo/portfolio --docker

FROM base AS build
COPY --from=prune /repo/out/json/ .
# The root `prepare` script, which skips installing Git hooks without `.git`.
COPY scripts ./scripts
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile
COPY --from=prune /repo/out/full/ .
# The environment has no required variable, so the build needs no placeholder:
# the container gets the real values when it starts.
RUN bun x turbo run build --filter=@repo/portfolio \
    && mkdir -p apps/portfolio/public
# The final image is Alpine. Bun installs sharp's binaries for both C
# libraries and Next traces both into the standalone server: keep the musl
# one, drop the glibc one (and the links to it).
RUN if [ -d apps/portfolio/.next/standalone/node_modules/.bun ]; then \
      find apps/portfolio/.next/standalone/node_modules/.bun -maxdepth 1 \
        \( -name '@img+sharp-linux-*' -o -name '@img+sharp-libvips-linux-*' \) \
        -exec rm -rf {} + ; \
    fi \
    && find apps/portfolio/.next/standalone -xtype l -delete

# The final image: Bun, and the standalone server Next traced, its hashed
# assets, and `public/`. No dependencies installed, no sources.
FROM oven/bun:${BUN_VERSION}-alpine AS app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=bun:bun /repo/apps/portfolio/.next/standalone ./
COPY --from=build --chown=bun:bun /repo/apps/portfolio/.next/static ./apps/portfolio/.next/static
COPY --from=build --chown=bun:bun /repo/apps/portfolio/public ./apps/portfolio/public
WORKDIR /app/apps/portfolio
USER bun
EXPOSE 3000
CMD ["bun", "server.js"]
