import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import { E2E } from "../playwright.config.ts"
import { OUTBOX_FILE, type OutboxEntry, parseOutbox } from "../src/lib/outbox.ts"

/** What the app would have sent: with no Resend key, it appends here instead. */
function readOutbox(): OutboxEntry[] {
  try {
    return parseOutbox(readFileSync(join(E2E.outboxDirectory, OUTBOX_FILE), "utf8"))
  } catch {
    // Nothing sent yet: the file is created on the first message.
    return []
  }
}

test("an incomplete message is sent back with the problems", async ({ page }) => {
  await page.goto("/contact")
  await page.getByLabel("Nom").fill("A")
  await page.getByLabel("E-mail").fill("not-an-email")
  await page.getByRole("button", { name: "Envoyer le message" }).click()

  await expect(page.getByText("C'est un peu court.")).toBeVisible()
  await expect(page.getByText("Cette adresse e-mail ne semble pas valide.")).toBeVisible()
  await expect(page.getByText("Ce champ est requis.")).toBeVisible()
  // What was typed stays in the form.
  await expect(page.getByLabel("E-mail")).toHaveValue("not-an-email")
})

test("a message reaches the inbox with the visitor as reply-to", async ({ page }) => {
  const email = `visitor-${String(Date.now())}@example.com`

  await page.goto("/en/contact")
  await page.getByLabel("Name").fill("Grace Hopper")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Company (optional)").fill("Navy")
  await page.getByLabel("Message").fill("Hello, <b>this</b> is a message from the e2e suite.")
  await page.getByRole("button", { name: "Send the message" }).click()

  const status = page.getByRole("status")
  await expect(status.getByRole("heading", { name: "Message sent" })).toBeVisible()
  const reference = (await status.getByText(/Ref\./).textContent())?.replace(/.*Ref\.\s*/, "")

  // The request returns once the outbox line is written, but poll anyway: the
  // assertion should not depend on that ordering.
  await expect.poll(() => readOutbox().find((entry) => entry.replyTo === email)).toBeDefined()
  const sent = readOutbox().find((entry) => entry.replyTo === email)
  expect(sent?.subject).toContain(reference ?? "missing reference")
  expect(sent?.text).toContain("Grace Hopper (Navy)")
  expect(sent?.html).toContain("&lt;b&gt;this&lt;/b&gt;")

  await page.getByRole("button", { name: "Write another message" }).click()
  await expect(page.getByLabel("Name")).toHaveValue("")
})
