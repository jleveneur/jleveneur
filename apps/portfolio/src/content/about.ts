import type { Localized } from "@/i18n/config"

export const intro: Localized<string[]> = {
  fr: [
    "Je suis développeur full-stack. J'aime prendre un produit de l'idée au serveur : modéliser les données, écrire l'API, construire l'interface, puis la mettre en ligne et la surveiller.",
    "Je travaille surtout en TypeScript, avec React et Next.js côté interface et Node.js côté serveur. J'accorde autant d'importance à ce qui ne se voit pas : la façon dont un projet se teste, se déploie et se relit six mois plus tard.",
    "Ce site en est un exemple : un monorepo vérifié à chaque commit, une application Next.js déployée en conteneur sur un VPS que j'administre, et un formulaire de contact qui passe par Resend."
  ],
  en: [
    "I am a full-stack developer. I like taking a product from idea to server: modelling the data, writing the API, building the interface, then shipping it and keeping an eye on it.",
    "I mostly work in TypeScript, with React and Next.js for interfaces and Node.js on the server. I care just as much about what does not show: how a project is tested, deployed, and read again six months later.",
    "This site is an example: a monorepo checked on every commit, a Next.js app deployed as a container on a VPS I run, and a contact form that goes through Resend."
  ]
}

export type Principle = { title: Localized; body: Localized }

export const principles: Principle[] = [
  {
    title: { fr: "Typé de bout en bout", en: "Typed end to end" },
    body: {
      fr: "Du schéma de la base au composant, en passant par l'API. Pas de `any`, et chaque entrée externe est validée à la frontière.",
      en: "From the database schema to the component, through the API. No `any`, and every external input is validated at the boundary."
    }
  },
  {
    title: { fr: "Vérifier en exécutant", en: "Verify by running" },
    body: {
      fr: "Lire du code donne une hypothèse ; un test donne une preuve. Unitaires, intégration contre une vraie base, parcours dans un vrai navigateur.",
      en: "Reading code gives a hypothesis; a test gives evidence. Unit tests, integration against a real database, journeys in a real browser."
    }
  },
  {
    title: { fr: "Peu de dépendances", en: "Few dependencies" },
    body: {
      fr: "Chaque dépendance est une décision : épinglée, justifiée, et retirée dès qu'elle ne sert plus.",
      en: "Every dependency is a decision: pinned, justified, and removed as soon as it stops earning its place."
    }
  },
  {
    title: { fr: "L'infrastructure est du code", en: "Infrastructure is code" },
    body: {
      fr: "Versionnée avec l'application, rejouée à chaque déploiement, et réversible en relançant un commit plus ancien.",
      en: "Versioned with the application, replayed on every deploy, and reversible by redeploying an older commit."
    }
  }
]

export type StackGroup = { title: Localized; items: string[] }

export const stackGroups: StackGroup[] = [
  {
    title: { fr: "Interface", en: "Front end" },
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "shadcn/ui"]
  },
  {
    title: { fr: "Serveur", en: "Back end" },
    items: ["Node.js", "Bun", "oRPC", "NestJS", "Better Auth", "Resend"]
  },
  {
    title: { fr: "Données", en: "Data" },
    items: ["PostgreSQL", "Drizzle ORM", "Zod"]
  },
  {
    title: { fr: "Infra", en: "Infrastructure" },
    items: ["Docker", "Caddy", "GitHub Actions", "Linux"]
  },
  {
    title: { fr: "Qualité", en: "Quality" },
    items: ["Playwright", "bun test", "Oxlint", "Knip", "Turborepo"]
  }
]
