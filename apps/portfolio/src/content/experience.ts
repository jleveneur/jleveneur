import type { Localized } from "@/i18n/config"

/** Months are written `YYYY-MM`; `formatPeriod` turns them into words. */
export type Period = { start: string; end?: string }

export type Position = Period & {
  title: Localized
  organization: string
  /** Freelance, work-study… */
  contract: Localized
  location: Localized
  summary: Localized
  stack: string[]
}

export type Degree = Period & {
  degree: Localized
  school: string
  summary: Localized
  stack?: string[]
}

const fullStack: Localized = { fr: "Développeur full-stack", en: "Full-stack developer" }
const freelance: Localized = { fr: "Freelance", en: "Freelance" }
const workStudy: Localized = { fr: "Alternance", en: "Work-study" }
const amiens: Localized = { fr: "Amiens", en: "Amiens, France" }

/** Newest first. */
export const positions: Position[] = [
  {
    start: "2025-02",
    title: fullStack,
    organization: "Dimension Studios",
    contract: freelance,
    location: { fr: "À distance", en: "Remote" },
    summary: {
      fr: "Développement full-stack d'une plateforme SaaS : applications Next.js, API tRPC, workers BullMQ et déploiement sur Kubernetes. Contributeur principal de Better Bull Board.",
      en: "Full-stack development of a SaaS platform: Next.js apps, a tRPC API, BullMQ workers and deployment to Kubernetes. Core contributor to Better Bull Board."
    },
    stack: ["Next.js", "PostgreSQL", "TypeScript", "BullMQ", "Kubernetes"]
  },
  {
    start: "2024-10",
    title: fullStack,
    organization: "Freelance",
    contract: freelance,
    location: { fr: "À distance", en: "Remote" },
    summary: {
      fr: "Conception et développement d'applications web modernes, front-end et back-end, pour des solutions sur mesure adaptées aux besoins de chaque client.",
      en: "Designing and building modern web applications, front end and back end, as tailored solutions fitted to each client's needs."
    },
    stack: ["Next.js", "Tailwind CSS", "TypeScript"]
  },
  {
    start: "2023-04",
    end: "2024-09",
    title: {
      fr: "Concepteur et développeur applicatifs",
      en: "Application designer and developer"
    },
    organization: "Assurance Maladie de la Somme",
    contract: workStudy,
    location: amiens,
    summary: {
      fr: "Développement d'une application web de revue des habilitations, au service de la sécurité informatique et de l'organisation des équipes. Participation à la gestion de projet.",
      en: "Built a web application for access-rights reviews, serving IT security and team organization. Took part in project management."
    },
    stack: ["Symfony", "SQL"]
  },
  {
    start: "2022-09",
    end: "2023-03",
    title: fullStack,
    organization: "PIDEV",
    contract: workStudy,
    location: amiens,
    summary: {
      fr: "Maintenance et évolution d'un site web interne, et création d'une application de suivi des entretiens techniques des véhicules.",
      en: "Maintained and extended an internal website, and built an application to track vehicles' technical servicing."
    },
    stack: ["Symfony", "React"]
  },
  {
    start: "2021-09",
    end: "2022-10",
    title: {
      fr: "Concepteur et développeur d'applications",
      en: "Application designer and developer"
    },
    organization: "Assurance Maladie de la Somme",
    contract: workStudy,
    location: amiens,
    summary: {
      fr: "Contribution à une API REST qui centralise les informations des agents, et conception d'une application web de recensement des applications métiers.",
      en: "Contributed to a REST API centralizing staff information, and designed a web application that inventories business applications."
    },
    stack: ["Symfony", "React"]
  }
]

/** Newest first. */
export const degrees: Degree[] = [
  {
    start: "2022-09",
    end: "2024-09",
    degree: { fr: "Master MIAGE", en: "Master's degree, MIAGE (computer engineering)" },
    school: "Université de Picardie Jules Verne",
    summary: {
      fr: "Parcours Ingénierie de la transformation digitale : gestion de projet, applications métiers et transformation numérique.",
      en: "Digital transformation engineering track: project management, business applications and digital transformation."
    },
    stack: ["Spring"]
  },
  {
    start: "2021-09",
    end: "2022-06",
    degree: {
      fr: "Licence professionnelle Informatique",
      en: "Professional bachelor's degree, Computer science"
    },
    school: "IUT d'Amiens — UPJV",
    summary: {
      fr: "Spécialité progiciels de gestion intégrés (ERP) : réseaux, systèmes d'information et bases de données.",
      en: "Enterprise resource planning (ERP) specialty: networks, information systems and databases."
    }
  },
  {
    start: "2019-09",
    end: "2021-06",
    degree: { fr: "DUT Informatique", en: "Two-year technical degree (DUT), Computer science" },
    school: "IUT d'Amiens — UPJV",
    summary: {
      fr: "Spécialité développement web : programmation, développement web et gestion de projets informatiques.",
      en: "Web development specialty: programming, web development and IT project management."
    }
  },
  {
    start: "2016-09",
    end: "2019-06",
    degree: { fr: "Baccalauréat scientifique", en: "Scientific baccalaureate" },
    school: "Lycée Condorcet, Méru",
    summary: {
      fr: "Spécialité Sciences de la vie et de la Terre.",
      en: "Life and Earth sciences specialty."
    }
  }
]
