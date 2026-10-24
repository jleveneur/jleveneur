import type { Localized } from "@/i18n/config"
import type { Schematic } from "@/lib/schematic"

export type Project = {
  slug: string
  title: string
  kind: Localized
  year: string
  role: Localized
  summary: Localized
  stack: string[]
  links: { label: string; href: string }[]
  context: Localized
  built: Localized<string[]>
  decisions: Localized<string[]>
  schematic: Schematic
  /** Shown on the homepage. */
  featured: boolean
}

export const projects: Project[] = [
  {
    slug: "hydromag",
    title: "Hydromag",
    kind: { fr: "Site vitrine et configurateur", en: "Showcase site and configurator" },
    year: "2026",
    role: { fr: "Conception, développement, hébergement", en: "Design, development, hosting" },
    summary: {
      fr: "Le site bilingue d'un spécialiste de l'hydraulique, et un configurateur de vérins qui envoie des demandes de devis.",
      en: "The bilingual site of a hydraulics specialist, and a cylinder configurator that sends quote requests."
    },
    stack: [
      "Next.js",
      "TypeScript",
      "next-intl",
      "oRPC",
      "Drizzle",
      "PostgreSQL",
      "Resend",
      "Docker"
    ],
    links: [{ label: "hydromag.fr", href: "https://hydromag.fr" }],
    context: {
      fr: "Hydromag avait besoin d'une vitrine en français et en anglais, et d'un outil qui permette à un client de décrire le vérin dont il a besoin sans passer par un appel.",
      en: "Hydromag needed a storefront in French and English, and a tool that lets a customer describe the cylinder they need without picking up the phone."
    },
    built: {
      fr: [
        "Une brochure bilingue, avec des URLs traduites et une mesure d'audience sans cookie.",
        "Un configurateur de vérins hydrauliques qui lit un catalogue dans PostgreSQL et envoie les demandes de devis par e-mail.",
        "Des applications Next.js servies sur un même domaine, livrées en images Docker et déployées automatiquement."
      ],
      en: [
        "A bilingual brochure, with translated URLs and cookie-free audience measurement.",
        "A hydraulic cylinder configurator that reads a catalogue from PostgreSQL and emails quote requests.",
        "Next.js apps served on one domain, shipped as Docker images and deployed automatically."
      ]
    },
    decisions: {
      fr: [
        "Le configurateur est monté sur le domaine de la brochure par des rewrites, pour qu'un visiteur ne change jamais de site.",
        "Chaque image est construite à partir d'un `turbo prune` du monorepo : elle n'embarque que ce dont l'application dépend.",
        "Un déploiement épingle les images d'un commit : revenir en arrière, c'est relancer le workflow avec un commit plus ancien."
      ],
      en: [
        "The configurator is mounted on the brochure's domain through rewrites, so a visitor never changes site.",
        "Each image is built from a `turbo prune` of the monorepo: it only carries what the app depends on.",
        "A deploy pins one commit's images: rolling back is running the workflow with an older commit."
      ]
    },
    schematic: {
      width: 480,
      height: 210,
      nodes: [
        {
          id: "visitor",
          label: { fr: "Visiteur", en: "Visitor" },
          x: 4,
          y: 83,
          w: 76,
          h: 44,
          tone: "dashed"
        },
        { id: "caddy", label: "Caddy", note: "TLS", x: 112, y: 83, w: 80, h: 44 },
        { id: "web", label: "Brochure", note: "FR / EN", x: 236, y: 12, w: 112, h: 44 },
        {
          id: "configurator",
          label: { fr: "Configurateur", en: "Configurator" },
          x: 236,
          y: 154,
          w: 112,
          h: 44
        },
        { id: "db", label: "Postgres", x: 388, y: 154, w: 88, h: 44, tone: "accent" }
      ],
      edges: [
        { from: "visitor", to: "caddy" },
        { from: "caddy", to: "web" },
        { from: "web", to: "configurator" },
        { from: "configurator", to: "db" }
      ]
    },
    featured: true
  },
  {
    slug: "agentcfg",
    title: "agentcfg",
    kind: { fr: "CLI open source publiée sur npm", en: "Open-source CLI published on npm" },
    year: "2026",
    role: { fr: "Auteur et mainteneur", en: "Author and maintainer" },
    summary: {
      fr: "Une seule configuration MCP pour Cursor, Claude Code, Codex, VS Code et Gemini CLI, et un scan qui retrouve chaque serveur MCP de la machine.",
      en: "One MCP config for Cursor, Claude Code, Codex, VS Code and Gemini CLI, plus a scan that finds every MCP server on the machine."
    },
    stack: ["TypeScript", "Node.js", "node:test", "npm"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/@jleveneur/agentcfg" },
      {
        label: "GitHub",
        href: "https://github.com/jleveneur/jleveneur/tree/main/packages/agentcfg"
      }
    ],
    context: {
      fr: "Chaque agent de code range ses serveurs MCP à sa façon : son fichier, son format, sa syntaxe pour référencer un secret. Le même serveur finit écrit trois fois, et diverge.",
      en: "Every coding agent keeps its MCP servers its own way: its own file, its own format, its own syntax for a secret. The same server ends up written three times, and drifts."
    },
    built: {
      fr: [
        "Un manifeste unique, d'où la CLI écrit les fichiers de chaque agent dans son propre format.",
        "Une commande `scan` en lecture seule qui regroupe les serveurs par ce vers quoi ils pointent, pour qu'un serveur écrit de trois façons n'apparaisse qu'une fois.",
        "Le partage des skills entre agents, et le support des variables `CLAUDE_CONFIG_DIR` et `CODEX_HOME`."
      ],
      en: [
        "A single manifest, from which the CLI writes each agent's files in its own format.",
        "A read-only `scan` that groups servers by what they point to, so one server spelled three ways shows up once.",
        "Skills shared between agents, and support for `CLAUDE_CONFIG_DIR` and `CODEX_HOME`."
      ]
    },
    decisions: {
      fr: [
        "Aucune dépendance interne au monorepo : le paquet se construit vers `dist/` pour Node 22.13 et plus.",
        "Publication par trusted publishing (OIDC, avec provenance) : aucun token npm n'est stocké."
      ],
      en: [
        "No internal monorepo dependency: the package builds to `dist/` for Node 22.13 and later.",
        "Published through trusted publishing (OIDC, with provenance): no npm token is stored."
      ]
    },
    schematic: {
      width: 480,
      height: 250,
      nodes: [
        { id: "manifest", label: "agentcfg.json", x: 4, y: 103, w: 128, h: 44, tone: "accent" },
        { id: "cli", label: "sync", note: "CLI", x: 168, y: 103, w: 84, h: 44 },
        { id: "cursor", label: "Cursor", x: 300, y: 4, w: 176, h: 36 },
        { id: "claude", label: "Claude Code", x: 300, y: 54, w: 176, h: 36 },
        { id: "codex", label: "Codex", x: 300, y: 107, w: 176, h: 36 },
        { id: "vscode", label: "VS Code", x: 300, y: 160, w: 176, h: 36 },
        { id: "gemini", label: "Gemini CLI", x: 300, y: 210, w: 176, h: 36 }
      ],
      edges: [
        { from: "manifest", to: "cli" },
        { from: "cli", to: "cursor" },
        { from: "cli", to: "claude" },
        { from: "cli", to: "codex" },
        { from: "cli", to: "vscode" },
        { from: "cli", to: "gemini" }
      ]
    },
    featured: true
  },
  {
    slug: "next-starter",
    title: "Next.js starter",
    kind: { fr: "Monorepo de démarrage", en: "Starter monorepo" },
    year: "2026",
    role: { fr: "Auteur", en: "Author" },
    summary: {
      fr: "Un monorepo Next.js prêt pour la production : authentification, organisations multi-tenant, API typée, et une chaîne de vérification complète. Exporté en un nouveau dépôt avec une commande.",
      en: "A production-ready Next.js monorepo: authentication, multi-tenant organizations, a typed API, and a complete verification pipeline. Exported as a new repository with one command."
    },
    stack: [
      "Next.js",
      "Better Auth",
      "oRPC",
      "Drizzle",
      "PostgreSQL",
      "Turborepo",
      "Bun",
      "Playwright"
    ],
    links: [{ label: "GitHub", href: "https://github.com/jleveneur/jleveneur" }],
    context: {
      fr: "Chaque nouveau projet recommençait par les mêmes semaines : authentification, rôles, base de données, lint, tests, CI. Ce starter les règle une fois, avec des choix assumés et documentés.",
      en: "Every new project started with the same weeks: authentication, roles, database, lint, tests, CI. This starter settles them once, with deliberate, documented choices."
    },
    built: {
      fr: [
        "Des organisations avec rôles et permissions, partagées entre le serveur et le navigateur sans tirer la base de données côté client.",
        "Des procédures oRPC composées de gardes : session, tenant, puis permission. Chaque requête est filtrée par organisation.",
        "Un e-mail transactionnel via Resend, avec une boîte d'envoi locale pour cloner et tester sans compte.",
        "`bun run check` : format, lint typé, typecheck, code mort, React Doctor et tests unitaires, plus des suites d'intégration et Playwright."
      ],
      en: [
        "Organizations with roles and permissions, shared between server and browser without pulling the database into the client.",
        "oRPC procedures composed from guards: session, tenant, then permission. Every query is scoped by organization.",
        "Transactional email through Resend, with a local outbox to clone and test without an account.",
        "`bun run check`: format, type-aware lint, typecheck, dead code, React Doctor and unit tests, plus integration and Playwright suites."
      ]
    },
    decisions: {
      fr: [
        "Un sens de dépendance unique, `env → db → auth → api → web` : un cycle entre paquets est une erreur de conception.",
        "Le périmètre est une fonctionnalité : files, cache, paiements ou analytics ont été retirés exprès."
      ],
      en: [
        "One dependency direction, `env → db → auth → api → web`: a cycle between packages is a design error.",
        "Scope is a feature: queues, caching, payments and analytics were removed on purpose."
      ]
    },
    schematic: {
      width: 480,
      height: 250,
      nodes: [
        { id: "env", label: "env", x: 4, y: 103, w: 72, h: 44 },
        { id: "db", label: "db", x: 100, y: 103, w: 72, h: 44 },
        { id: "auth", label: "auth", x: 196, y: 103, w: 80, h: 44, tone: "accent" },
        { id: "authz", label: "authz", x: 196, y: 12, w: 80, h: 40 },
        { id: "email", label: "email", x: 196, y: 198, w: 80, h: 40 },
        { id: "api", label: "api", x: 300, y: 103, w: 72, h: 44 },
        { id: "web", label: "web", x: 396, y: 103, w: 80, h: 44 }
      ],
      edges: [
        { from: "env", to: "db" },
        { from: "db", to: "auth" },
        { from: "authz", to: "auth" },
        { from: "email", to: "auth" },
        { from: "auth", to: "api" },
        { from: "api", to: "web" }
      ]
    },
    featured: true
  },
  {
    slug: "vps",
    title: "VPS & services",
    kind: { fr: "Infrastructure auto-hébergée", en: "Self-hosted infrastructure" },
    year: "2026",
    role: { fr: "Administration et automatisation", en: "Administration and automation" },
    summary: {
      fr: "Le serveur qui héberge ce site : un reverse proxy partagé, des services en conteneurs, des sauvegardes chaque nuit, et des déploiements entièrement pilotés par GitHub Actions.",
      en: "The server behind this site: a shared reverse proxy, containerized services, nightly backups, and deploys driven entirely by GitHub Actions."
    },
    stack: ["Caddy", "Docker Compose", "GitHub Actions", "Umami", "Uptime Kuma"],
    links: [],
    context: {
      fr: "Plusieurs sites, quelques services de suivi, un seul petit serveur : il fallait que tout soit versionné, rejouable, et qu'un retour en arrière ne demande pas de reconstruire quoi que ce soit.",
      en: "Several sites, a few monitoring services, one small server: everything had to be versioned, replayable, and a rollback should never require rebuilding anything."
    },
    built: {
      fr: [
        "Un reverse proxy partagé : chaque projet versionne sa propre configuration, validée en CI avant d'atteindre le serveur.",
        "Une mesure d'audience sans cookie, une surveillance de la disponibilité et des ressources.",
        "Des sauvegardes automatiques chaque nuit, hors du serveur.",
        "Des déploiements déclenchés par un merge, sans aucune étape manuelle."
      ],
      en: [
        "A shared reverse proxy: each project versions its own configuration, validated in CI before it reaches the server.",
        "Cookie-free audience measurement, plus availability and resource monitoring.",
        "Automatic nightly backups, stored off the server.",
        "Deploys triggered by a merge, with no manual step."
      ]
    },
    decisions: {
      fr: [
        "Toute la configuration vit dans le dépôt : le serveur ne contient que ce qu'un déploiement y a copié.",
        "Les images sont épinglées à une version : une mise à jour passe par une pull request, comme le code.",
        "Les secrets sont générés sur le serveur et n'en sortent jamais."
      ],
      en: [
        "All configuration lives in the repository: the server only holds what a deploy copied there.",
        "Images are pinned to a version: an upgrade goes through a pull request, like code.",
        "Secrets are generated on the server and never leave it."
      ]
    },
    schematic: {
      width: 480,
      height: 250,
      nodes: [
        {
          id: "actions",
          label: "Actions",
          note: "CI/CD",
          x: 4,
          y: 103,
          w: 88,
          h: 44,
          tone: "dashed"
        },
        { id: "vps", label: "VPS", note: "Caddy", x: 132, y: 103, w: 88, h: 44, tone: "accent" },
        { id: "site", label: "jleveneur.com", x: 280, y: 4, w: 196, h: 36 },
        { id: "umami", label: "Umami", x: 280, y: 54, w: 196, h: 36 },
        { id: "kuma", label: "Uptime Kuma", x: 280, y: 107, w: 196, h: 36 },
        { id: "beszel", label: "Beszel", x: 280, y: 160, w: 196, h: 36 },
        {
          id: "r2",
          label: { fr: "Sauvegardes", en: "Backups" },
          x: 280,
          y: 210,
          w: 196,
          h: 36,
          tone: "dashed"
        }
      ],
      edges: [
        { from: "actions", to: "vps" },
        { from: "vps", to: "site" },
        { from: "vps", to: "umami" },
        { from: "vps", to: "kuma" },
        { from: "vps", to: "beszel" },
        { from: "vps", to: "r2" }
      ]
    },
    featured: false
  }
]

export function findProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
