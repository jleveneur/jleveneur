import { describe, expect, it } from "vitest"
import { z } from "zod"

import { parseKanbanEnv } from "./kanban.ts"
import { server } from "./schema.ts"

const schema = z.object(server)

const valid = {
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:5432/app",
  BETTER_AUTH_SECRET: "a".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000"
}

describe("server environment schema", () => {
  it("accepts a valid environment", () => {
    expect(schema.safeParse(valid).success).toBe(true)
  })

  it("rejects a DATABASE_URL that is not Postgres", () => {
    const result = schema.safeParse({ ...valid, DATABASE_URL: "mysql://localhost/app" })

    expect(result.error?.issues[0]?.message).toMatch(/postgres:\/\/ or postgresql:\/\/ URL/)
  })

  it("rejects an auth secret Better Auth would refuse", () => {
    const result = schema.safeParse({ ...valid, BETTER_AUTH_SECRET: "short" })

    expect(result.error?.issues[0]?.message).toMatch(/at least 32/)
  })

  // `z.url()` alone accepts this: it parses as a URL whose protocol is
  // `localhost:`. Better Auth needs a real origin, so the protocol is pinned.
  it("rejects a scheme-less BETTER_AUTH_URL", () => {
    const result = schema.safeParse({ ...valid, BETTER_AUTH_URL: "localhost:3000" })

    expect(result.error?.issues[0]?.message).toMatch(/http:\/\/ or https:\/\/ URL/)
  })

  it("accepts an https BETTER_AUTH_URL", () => {
    expect(schema.safeParse({ ...valid, BETTER_AUTH_URL: "https://app.example.com" }).success).toBe(
      true
    )
  })

  it("reports every problem at once", () => {
    const paths = schema.safeParse({}).error?.issues.map((issue) => issue.path[0])

    expect(paths).toStrictEqual(["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"])
  })
})

describe("kanban environment schema", () => {
  it("accepts auth vars without a Postgres URL", () => {
    expect(
      parseKanbanEnv({
        BETTER_AUTH_SECRET: "a".repeat(32),
        BETTER_AUTH_URL: "http://localhost:3002"
      })
    ).toMatchObject({
      BETTER_AUTH_URL: "http://localhost:3002",
      LOG_LEVEL: "info",
      AUTH_RATE_LIMIT: "on"
    })
  })

  it("rejects a short auth secret", () => {
    expect(() =>
      parseKanbanEnv({
        BETTER_AUTH_SECRET: "short",
        BETTER_AUTH_URL: "http://localhost:3002"
      })
    ).toThrow(/at least 32/)
  })
})
