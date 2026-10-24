/**
 * Exports the Next.js starter — apps/starter, the shared packages, tooling, and
 * the root configuration — as a new standalone repository:
 *
 *   bun run new-project ../my-app
 *
 * apps/starter becomes apps/web (@repo/web) there. Root files that mention this
 * repository's own projects are replaced by their starter version from
 * templates/next/. The `starter` workflow runs this
 * export and checks the result, so the template cannot rot unnoticed.
 */
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const OVERLAY = resolve(ROOT, "templates/next")
const OVERRIDES = "package.overrides.json"

// This repository's own projects, the VPS they run on, its workflows (the
// overlay brings the starter's CI), and the export itself.
const EXCLUDED = [
  "apps/portfolio/",
  "packages/agentcfg/",
  "deploy/",
  "docs/architecture.md",
  "templates/",
  ".github/workflows/",
  "scripts/new-project.ts"
]

const target = process.argv[2]
if (target === undefined) {
  console.error("Usage: bun run new-project <directory>")
  process.exit(1)
}

const destination = resolve(process.cwd(), target)
if (existsSync(destination) && readdirSync(destination).length > 0) {
  console.error(`${destination} is not empty.`)
  process.exit(1)
}

// The demo app is `starter` here, beside the portfolio; a new project calls it `web`.
const RENAMES: [string, string][] = [
  ["apps/starter", "apps/web"],
  ["@repo/starter", "@repo/web"]
]

function rename(text: string): string {
  return RENAMES.reduce((result, [from, to]) => result.replaceAll(from, to), text)
}

function copy(from: string, to: string): void {
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to)
}

const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter((file) => file !== "" && !EXCLUDED.some((prefix) => file.startsWith(prefix)))

for (const file of tracked) {
  const to = resolve(destination, rename(file))
  copy(resolve(ROOT, file), to)
  // Rewritten in place, which keeps the copied file's mode. A NUL byte means
  // binary, left untouched.
  const content = readFileSync(to)
  if (!content.includes(0)) {
    const text = content.toString("utf8")
    const renamed = rename(text)
    if (renamed !== text) writeFileSync(to, renamed)
  }
}

const overlay = readdirSync(OVERLAY, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name !== OVERRIDES)
  .map((entry) => relative(OVERLAY, resolve(entry.parentPath, entry.name)))

for (const file of overlay) {
  copy(resolve(OVERLAY, file), resolve(destination, file))
}

// Versions, engines, and the package manager come from this repository's root,
// so the export never lags behind what Renovate keeps current here.
const rootManifest: unknown = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"))
const overrides: unknown = JSON.parse(readFileSync(resolve(OVERLAY, OVERRIDES), "utf8"))
if (
  typeof rootManifest !== "object" ||
  rootManifest === null ||
  typeof overrides !== "object" ||
  overrides === null
) {
  throw new TypeError("package.json and package.overrides.json must be JSON objects.")
}
writeFileSync(
  resolve(destination, "package.json"),
  `${JSON.stringify({ ...rootManifest, ...overrides }, null, 2)}\n`
)

console.log(
  [
    `✓ Starter exported to ${destination} (${tracked.length + overlay.length} files).`,
    "",
    "  Next: git init, bun install (prunes bun.lock to this project), then follow README.md."
  ].join("\n")
)
