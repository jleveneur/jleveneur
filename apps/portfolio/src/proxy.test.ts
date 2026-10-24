import { describe, expect, test } from "bun:test"

import { NextRequest } from "next/server"

import { localePath, splitLocale } from "@/i18n/config"

import { proxy } from "./proxy.ts"

function run(path: string) {
  return proxy(new NextRequest(new URL(path, "https://jleveneur.com")))
}

describe("proxy", () => {
  test("serves an unprefixed path from the French pages", () => {
    expect(run("/").headers.get("x-middleware-rewrite")).toBe("https://jleveneur.com/fr")
    expect(run("/contact").headers.get("x-middleware-rewrite")).toBe(
      "https://jleveneur.com/fr/contact"
    )
  })

  test("leaves English paths alone", () => {
    const response = run("/en/projects")
    expect(response.headers.get("x-middleware-rewrite")).toBeNull()
    expect(response.headers.get("location")).toBeNull()
  })

  test("redirects the prefixed French URL to the canonical one", () => {
    const response = run("/fr/projects?from=x")
    expect(response.status).toBe(308)
    expect(response.headers.get("location")).toBe("https://jleveneur.com/projects?from=x")
    expect(run("/fr").headers.get("location")).toBe("https://jleveneur.com/")
  })

  test("does not mistake a path that only starts like a locale", () => {
    expect(run("/english").headers.get("x-middleware-rewrite")).toBe(
      "https://jleveneur.com/fr/english"
    )
  })
})

describe("localePath and splitLocale", () => {
  test("round-trip", () => {
    for (const path of ["/", "/projects", "/projects/agentcfg"]) {
      expect(splitLocale(localePath("fr", path))).toEqual({ locale: "fr", path })
      expect(splitLocale(localePath("en", path))).toEqual({ locale: "en", path })
    }
  })

  test("prefix English only", () => {
    expect(localePath("fr", "/")).toBe("/")
    expect(localePath("en", "/")).toBe("/en")
    expect(localePath("en", "/contact")).toBe("/en/contact")
  })
})
