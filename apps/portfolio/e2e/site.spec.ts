import { expect, test } from "@playwright/test"

import { projects } from "../src/content/projects.ts"
import { name, socialLinks } from "../src/content/site.ts"

test("the homepage is in French at the root", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveTitle(`${name} — Ingénieur full-stack & IA`)
  await expect(page.locator("html")).toHaveAttribute("lang", "fr")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Julien\s*Leveneur/i)
  await expect(page.getByRole("heading", { name: "Ce que je fais" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Projets sélectionnés" })).toBeVisible()

  await Promise.all(
    socialLinks.map(async (link) => {
      const item = page.getByRole("contentinfo").getByRole("link", { name: link.label })
      await expect(item).toHaveAttribute("href", link.href)
      await expect(item).toHaveAttribute("target", "_blank")
    })
  )
})

test("the language switch keeps the page", async ({ page }) => {
  await page.goto("/about")
  await page.getByRole("link", { name: "English" }).click()

  await expect(page).toHaveURL("/en/about")
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible()

  await page.getByRole("link", { name: "Français" }).click()
  await expect(page).toHaveURL("/about")
  await expect(page.getByRole("heading", { level: 1, name: "À propos" })).toBeVisible()
})

test("the French prefix redirects to the canonical URL", async ({ page }) => {
  await page.goto("/fr/contact")
  await expect(page).toHaveURL("/contact")
})

test("every project has its sheet, reachable from the list", async ({ page }) => {
  await page.goto("/en/projects")

  await Promise.all(
    projects.map((project) =>
      expect(page.getByRole("link", { name: project.title, exact: true })).toHaveAttribute(
        "href",
        `/en/projects/${project.slug}`
      )
    )
  )

  const [first] = projects
  if (first === undefined) {
    throw new Error("no project to open")
  }
  await page.getByRole("link", { name: first.title, exact: true }).click()
  await expect(page.getByRole("heading", { level: 1, name: first.title })).toBeVisible()
  await expect(page.getByRole("img", { name: `Diagram — ${first.title}` })).toBeVisible()
})

test("an unknown page answers 404 in its language", async ({ page }) => {
  const french = await page.goto("/nope")
  expect(french?.status()).toBe(404)
  await expect(page.getByRole("heading", { name: "Feuille introuvable" })).toBeVisible()

  const english = await page.goto("/en/projects/nope")
  expect(english?.status()).toBe(404)
  await expect(page.getByRole("heading", { name: "Sheet not found" })).toBeVisible()
})
