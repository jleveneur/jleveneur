import type { Locale } from "@/i18n/config"

const fr = {
  meta: {
    description:
      "Julien Leveneur, ingénieur full-stack & IA : applications web en TypeScript et React, APIs, infrastructure et briques IA, construites avec des agents et vérifiées par des types, du lint et des tests."
  },
  role: "Ingénieur full-stack & IA",
  nav: {
    label: "Navigation principale",
    home: "Accueil",
    projects: "Projets",
    experience: "Parcours",
    about: "À propos",
    contact: "Contact"
  },
  localeSwitch: {
    label: "Langue",
    fr: "Français",
    en: "English"
  },
  skipLink: "Aller au contenu",
  home: {
    sheet: "Élévation principale",
    pitch:
      "Je conçois et je construis des applications web de bout en bout : l'interface, l'API, la base de données et le serveur qui les fait tourner. Les agents IA sont mes outils du quotidien ; les types, le lint et les tests décident de ce qui part en production.",
    primaryCta: "Écrire un message",
    secondaryCta: "Voir les projets",
    stackFigure: "Coupe de la pile",
    servicesTitle: "Ce que je fais",
    servicesIntro:
      "Quatre spécialités, une même exigence : que ce soit typé, testé, et déployable.",
    projectsTitle: "Projets sélectionnés",
    projectsIntro: "Des produits en production et des outils publiés, chacun avec son plan.",
    allProjects: "Tous les projets",
    experienceTitle: "Parcours",
    experienceIntro: "Les postes récents. Le détail et la formation sont sur la page dédiée.",
    fullExperience: "Le parcours complet",
    ctaTitle: "Un projet, une question, une idée à confronter ?",
    ctaBody: "Le formulaire arrive directement dans ma boîte mail. Je réponds personnellement.",
    ctaButton: "Me contacter"
  },
  projects: {
    title: "Projets",
    intro:
      "Chaque projet est présenté comme une fiche technique : le contexte, ce que j'ai construit, et les décisions qui comptent.",
    year: "Année",
    role: "Rôle",
    stack: "Pile",
    links: "Liens",
    context: "Contexte",
    built: "Ce que j'ai construit",
    decisions: "Décisions techniques",
    figure: "Schéma",
    back: "Retour aux projets",
    next: "Projet suivant",
    open: "Ouvrir la fiche"
  },
  experience: {
    title: "Parcours",
    intro: "Où j'ai travaillé, sur quoi, et ce que j'ai étudié.",
    workTitle: "Expérience professionnelle",
    educationTitle: "Formation",
    present: "aujourd'hui"
  },
  about: {
    title: "À propos",
    principlesTitle: "Comment je travaille",
    stackTitle: "Outils du quotidien",
    elsewhere: "Ailleurs sur le web"
  },
  contact: {
    title: "Contact",
    intro:
      "Une mission, un poste, un projet open source ou simplement une question : écrivez-moi, le message m'arrive directement.",
    otherChannels: "Autres canaux",
    form: {
      name: "Nom",
      email: "E-mail",
      company: "Entreprise",
      optional: "facultatif",
      message: "Message",
      messagePlaceholder: "Quelques lignes sur votre projet ou votre question…",
      honeypot: "Ne pas remplir ce champ",
      privacyNote: "Vos données servent uniquement à vous répondre.",
      privacyLink: "Confidentialité",
      submit: "Envoyer le message",
      submitting: "Envoi…",
      sentTitle: "Message transmis",
      sentBody: "Merci ! Je reviens vers vous à l'adresse indiquée.",
      reference: "Réf.",
      another: "Écrire un autre message",
      errors: {
        required: "Ce champ est requis.",
        too_short: "C'est un peu court.",
        too_long: "C'est trop long.",
        invalid_email: "Cette adresse e-mail ne semble pas valide.",
        rate_limited: "Trop de messages envoyés d'un coup. Réessayez dans quelques minutes.",
        send_failed:
          "L'envoi a échoué de mon côté. Réessayez, ou écrivez-moi directement par e-mail."
      }
    }
  },
  notFound: {
    title: "Feuille introuvable",
    body: "Cette page n'existe pas, ou plus. Le plan d'ensemble est par ici.",
    home: "Retour à l'accueil"
  },
  footer: {
    project: "Projet",
    drawnBy: "Dessiné par",
    scale: "Échelle",
    revision: "Révision",
    source: "Code source",
    legal: "Mentions légales et confidentialité"
  },
  legal: {
    title: "Informations légales",
    intro: "Qui édite ce site, où il est hébergé, et ce qu'il advient de vos données.",
    updated: "Dernière mise à jour :"
  }
}

export type Dictionary = typeof fr

export type ContactErrorCode = keyof Dictionary["contact"]["form"]["errors"]

const en: Dictionary = {
  meta: {
    description:
      "Julien Leveneur, full-stack & AI engineer: web applications in TypeScript and React, APIs, infrastructure and AI building blocks, built with agents and verified by types, lint and tests."
  },
  role: "Full-stack & AI engineer",
  nav: {
    label: "Main navigation",
    home: "Home",
    projects: "Projects",
    experience: "Experience",
    about: "About",
    contact: "Contact"
  },
  localeSwitch: {
    label: "Language",
    fr: "Français",
    en: "English"
  },
  skipLink: "Skip to content",
  home: {
    sheet: "Front elevation",
    pitch:
      "I design and build web applications end to end: the interface, the API, the database and the server they run on. AI agents are my everyday tools; types, lint and tests decide what ships to production.",
    primaryCta: "Send a message",
    secondaryCta: "See the projects",
    stackFigure: "Stack section",
    servicesTitle: "What I do",
    servicesIntro: "Four specialties, one standard: typed, tested, and deployable.",
    projectsTitle: "Selected projects",
    projectsIntro: "Products in production and published tools, each with its drawing.",
    allProjects: "All projects",
    experienceTitle: "Experience",
    experienceIntro: "Recent positions. Details and education are on their own page.",
    fullExperience: "Full experience",
    ctaTitle: "A project, a question, an idea to test?",
    ctaBody: "The form lands straight in my inbox. I answer personally.",
    ctaButton: "Get in touch"
  },
  projects: {
    title: "Projects",
    intro:
      "Each project reads like a spec sheet: the context, what I built, and the decisions that matter.",
    year: "Year",
    role: "Role",
    stack: "Stack",
    links: "Links",
    context: "Context",
    built: "What I built",
    decisions: "Technical decisions",
    figure: "Diagram",
    back: "Back to projects",
    next: "Next project",
    open: "Open the sheet"
  },
  experience: {
    title: "Experience",
    intro: "Where I have worked, on what, and what I studied.",
    workTitle: "Work experience",
    educationTitle: "Education",
    present: "present"
  },
  about: {
    title: "About",
    principlesTitle: "How I work",
    stackTitle: "Everyday tools",
    elsewhere: "Elsewhere on the web"
  },
  contact: {
    title: "Contact",
    intro:
      "A contract, a role, an open-source project or just a question: write to me, the message reaches me directly.",
    otherChannels: "Other channels",
    form: {
      name: "Name",
      email: "Email",
      company: "Company",
      optional: "optional",
      message: "Message",
      messagePlaceholder: "A few lines about your project or your question…",
      honeypot: "Leave this field empty",
      privacyNote: "Your details are used only to answer you.",
      privacyLink: "Privacy",
      submit: "Send the message",
      submitting: "Sending…",
      sentTitle: "Message sent",
      sentBody: "Thank you! I will get back to you at the address you gave.",
      reference: "Ref.",
      another: "Write another message",
      errors: {
        required: "This field is required.",
        too_short: "That is a little short.",
        too_long: "That is too long.",
        invalid_email: "This email address does not look valid.",
        rate_limited: "Too many messages at once. Try again in a few minutes.",
        send_failed: "Sending failed on my side. Try again, or email me directly."
      }
    }
  },
  notFound: {
    title: "Sheet not found",
    body: "This page does not exist, or no longer does. The general plan is this way.",
    home: "Back to the homepage"
  },
  footer: {
    project: "Project",
    drawnBy: "Drawn by",
    scale: "Scale",
    revision: "Revision",
    source: "Source code",
    legal: "Legal notice and privacy"
  },
  legal: {
    title: "Legal information",
    intro: "Who publishes this site, where it is hosted, and what happens to your data.",
    updated: "Last updated:"
  }
}

const dictionaries: Record<Locale, Dictionary> = { fr, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
