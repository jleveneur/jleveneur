import { expect, test } from "@playwright/test"

import { links, name } from "../src/lib/content.ts"

test("the public homepage is the portfolio", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(name)
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible()
  await expect(page.getByRole("heading", { name: "About" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Stack" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Connect" })).toBeVisible()

  await Promise.all(
    links.map(async (link) => {
      const item = page.getByRole("link", { name: link.label })
      await expect(item).toHaveAttribute("href", link.href)
      if (link.external === true) {
        await expect(item).toHaveAttribute("target", "_blank")
      }
    })
  )

  await expect(page.getByRole("link", { name: "Create an account" })).toHaveCount(0)
})
