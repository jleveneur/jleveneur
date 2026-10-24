import type { Localized } from "@/i18n/config"

export type Service = {
  code: string
  title: Localized
  body: Localized
  tools: string[]
}

export const services: Service[] = [
  {
    code: "SPEC-01",
    title: { fr: "Applications web", en: "Web applications" },
    body: {
      fr: "Des interfaces rapides et accessibles, rendues côté serveur quand c'est possible, interactives là où il le faut.",
      en: "Fast, accessible interfaces, rendered on the server where possible and interactive where it matters."
    },
    tools: ["Next.js", "React", "TypeScript", "Tailwind CSS"]
  },
  {
    code: "SPEC-02",
    title: { fr: "APIs & back-end", en: "APIs & back end" },
    body: {
      fr: "Des APIs typées de bout en bout, une authentification sérieuse, des données cloisonnées par client.",
      en: "End-to-end typed APIs, serious authentication, and data scoped per tenant."
    },
    tools: ["Node.js", "oRPC", "NestJS", "PostgreSQL", "Drizzle"]
  },
  {
    code: "SPEC-03",
    title: { fr: "Infra & déploiement", en: "Infrastructure & deployment" },
    body: {
      fr: "Du commit à la production sans étape manuelle, avec un retour en arrière en une commande.",
      en: "From commit to production with no manual step, and a rollback in one command."
    },
    tools: ["Docker", "Kubernetes", "Terraform", "GitHub Actions"]
  },
  {
    code: "SPEC-04",
    title: { fr: "Outillage & DX", en: "Tooling & DX" },
    body: {
      fr: "Des monorepos où le lint, les types et les tests attrapent les erreurs avant la relecture, et des agents de code bien configurés.",
      en: "Monorepos where lint, types and tests catch mistakes before review, and well-configured coding agents."
    },
    tools: ["Turborepo", "Bun", "Oxlint", "Playwright", "MCP"]
  }
]
