import { createReadStream } from "node:fs"
import { access, stat } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(fileURLToPath(new URL("../out", import.meta.url)))

function portFromArgv(argv: string[]): number {
  let port = 3001
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--port") {
      const value = argv[i + 1]
      if (value !== undefined) {
        port = Number(value)
      }
    }
  }
  return port
}

const port = portFromArgv(process.argv)

const types: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

function isInsideRoot(file: string): boolean {
  const rel = relative(root, file)
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".."
}

async function existingFile(file: string): Promise<string | undefined> {
  const normalized = resolve(file)
  if (!isInsideRoot(normalized)) {
    return undefined
  }
  try {
    const info = await stat(normalized)
    return info.isFile() ? normalized : undefined
  } catch {
    return undefined
  }
}

async function resolveFile(
  pathname: string,
): Promise<{ file: string; status: number } | undefined> {
  const decoded = decodeURIComponent(pathname)
  const candidates: string[] = []
  if (decoded === "/" || decoded === "") {
    candidates.push(join(root, "index.html"))
  } else if (decoded.endsWith("/")) {
    candidates.push(join(root, decoded, "index.html"))
  } else {
    candidates.push(join(root, decoded))
    candidates.push(join(root, `${decoded}.html`))
    candidates.push(join(root, decoded, "index.html"))
  }

  const files = await Promise.all(candidates.map(existingFile))
  const file = files.find((candidate) => candidate !== undefined)
  if (file !== undefined) {
    return { file, status: 200 }
  }

  const notFound = await existingFile(join(root, "404.html"))
  if (notFound !== undefined) {
    return { file: notFound, status: 404 }
  }
  return undefined
}

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? "/", `http://127.0.0.1:${String(port)}`)
    const resolved = await resolveFile(url.pathname)
    if (resolved === undefined) {
      res.writeHead(404)
      res.end("Not found")
      return
    }
    await access(resolved.file)
    res.writeHead(resolved.status, {
      "content-type": types[extname(resolved.file)] ?? "application/octet-stream",
    })
    createReadStream(resolved.file).pipe(res)
  })().catch(() => {
    if (!res.headersSent) {
      res.writeHead(500)
    }
    res.end()
  })
})

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Serving ${root} on http://127.0.0.1:${String(port)}\n`)
})
