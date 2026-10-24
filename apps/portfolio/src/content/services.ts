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
    title: { fr: "Agents IA & DX", en: "AI agents & DX" },
    body: {
      fr: "Des agents de code configurés pour le projet, des serveurs MCP sur mesure, et un monorepo dont le lint, les types et les tests attrapent leurs erreurs avant la relecture.",
      en: "Coding agents configured for the project, custom MCP servers, and a monorepo whose lint, types and tests catch their mistakes before review."
    },
    tools: ["Claude Code", "Codex", "Cursor", "MCP", "Turborepo"]
  }
]
