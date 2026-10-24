import { email, name } from "@/content/site"
import type { Localized } from "@/i18n/config"

export type LegalBlock = { heading: string; paragraphs: string[] }

export type LegalPart = { id: string; title: string; blocks: LegalBlock[] }

/** Shown at the bottom of the page; change it with the text. */
export const legalUpdated = "2026-10-24"

const address = "5 bis chemin de la Reine Blanche, 95810 Berville, France"
const siret = "934 200 643 00021"

/**
 * The legal notice (LCEN, art. 6) and the privacy policy (GDPR, art. 13).
 * The facts about the server, Resend and Umami match Hydromag's legal page:
 * both sites share the VPS and its services. A change to the deployment, the
 * Caddy logs or a processor needs the same change here.
 */
export const legal: Localized<LegalPart[]> = {
  fr: [
    {
      id: "legal-notice",
      title: "Mentions légales",
      blocks: [
        {
          heading: "Éditeur",
          paragraphs: [
            `Ce site est édité par ${name}, entrepreneur individuel (micro-entreprise), SIRET ${siret}, domicilié ${address}.`,
            `Contact : ${email}, ou le formulaire de la page Contact.`,
            `Directeur de la publication : ${name}.`
          ]
        },
        {
          heading: "Hébergement",
          paragraphs: [
            "Le site est hébergé par Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Allemagne (+49 9831 505-0, www.hetzner.com), sur un serveur situé en Allemagne."
          ]
        },
        {
          heading: "Propriété intellectuelle",
          paragraphs: [
            `Les textes, le design et les schémas de ce site sont la propriété de ${name}. Les noms et marques des projets présentés appartiennent à leurs titulaires respectifs. Le code source du site est consultable publiquement sur GitHub.`
          ]
        }
      ]
    },
    {
      id: "privacy",
      title: "Confidentialité",
      blocks: [
        {
          heading: "Responsable du traitement",
          paragraphs: [
            `${name}, ${address}, ${email}. Ce site ne dépose aucun cookie et ne vous demande aucun consentement : il n'en a pas besoin.`
          ]
        },
        {
          heading: "Formulaire de contact",
          paragraphs: [
            "Quand vous m'écrivez, je reçois votre nom, votre adresse e-mail, le nom de votre entreprise si vous l'indiquez, et votre message. Ils servent uniquement à vous répondre et à suivre l'échange qui peut en découler. Le traitement repose sur votre demande (mesures précontractuelles) et sur mon intérêt légitime à répondre aux personnes qui me contactent.",
            "Le message n'est pas enregistré sur le serveur : il est transmis directement par e-mail. Il est envoyé par Resend (Plus Five Five, Inc., San Francisco, États-Unis), un service d'envoi d'e-mails qui agit pour mon compte, puis reçu dans ma messagerie Gmail (Google LLC, États-Unis). Vos données sont donc traitées aux États-Unis ; ces transferts sont encadrés par le cadre de protection des données UE–États-Unis (Data Privacy Framework), auquel les deux sociétés ont adhéré, et par les clauses contractuelles types de la Commission européenne.",
            "Les messages sont conservés trois ans au plus après notre dernier échange."
          ]
        },
        {
          heading: "Mesure d'audience",
          paragraphs: [
            "L'audience du site est mesurée avec Umami, un logiciel libre installé sur le même serveur : les statistiques ne sont confiées à aucun service de mesure tiers. Umami ne dépose pas de cookie et ne conserve pas l'adresse IP. Les statistiques sont agrégées : page consultée, site référent, localisation approximative, langue, type d'appareil, navigateur et système d'exploitation. Pour compter les visiteurs, Umami calcule un identifiant anonyme renouvelé chaque mois, qui n'est associé à aucune identité.",
            "Une sauvegarde de ces statistiques est conservée 90 jours au plus par Cloudflare, Inc., pour mon compte, dans un espace de stockage restreint à l'Union européenne."
          ]
        },
        {
          heading: "Journaux du serveur",
          paragraphs: [
            "Le serveur enregistre les données techniques de chaque connexion : adresse IP, date, page demandée et navigateur. Elles servent à acheminer les pages et à protéger le site contre les abus, sur la base de mon intérêt légitime, et sont supprimées après 90 jours. Elles ne sont ni sauvegardées ni transmises."
          ]
        },
        {
          heading: "Vos droits",
          paragraphs: [
            `Vous pouvez accéder à vos données, les faire rectifier ou effacer, vous opposer à leur traitement, en demander la limitation ou la portabilité, en m'écrivant à ${email}. Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (www.cnil.fr).`
          ]
        }
      ]
    }
  ],
  en: [
    {
      id: "legal-notice",
      title: "Legal notice",
      blocks: [
        {
          heading: "Publisher",
          paragraphs: [
            `This site is published by ${name}, sole proprietor (French micro-entreprise), SIRET ${siret}, based at ${address}.`,
            `Contact: ${email}, or the form on the Contact page.`,
            `Publication director: ${name}.`
          ]
        },
        {
          heading: "Hosting",
          paragraphs: [
            "The site is hosted by Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany (+49 9831 505-0, www.hetzner.com), on a server located in Germany."
          ]
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            `The texts, design and diagrams of this site belong to ${name}. The names and trademarks of the projects shown belong to their respective owners. The site's source code is publicly available on GitHub.`
          ]
        }
      ]
    },
    {
      id: "privacy",
      title: "Privacy",
      blocks: [
        {
          heading: "Data controller",
          paragraphs: [
            `${name}, ${address}, ${email}. This site sets no cookies and asks for no consent: it does not need any.`
          ]
        },
        {
          heading: "Contact form",
          paragraphs: [
            "When you write to me, I receive your name, your email address, your company if you give it, and your message. They are used only to answer you and to follow up on the conversation that may come of it. The processing rests on your request (pre-contractual steps) and on my legitimate interest in answering the people who contact me.",
            "The message is not stored on the server: it is passed straight on by email. It is sent by Resend (Plus Five Five, Inc., San Francisco, United States), an email delivery service acting on my behalf, then received in my Gmail mailbox (Google LLC, United States). Your data is therefore processed in the United States; these transfers are covered by the EU–U.S. Data Privacy Framework, to which both companies have certified, and by the European Commission's standard contractual clauses.",
            "Messages are kept for at most three years after our last exchange."
          ]
        },
        {
          heading: "Audience measurement",
          paragraphs: [
            "The site's audience is measured with Umami, free software installed on the same server: the statistics are entrusted to no third-party analytics service. Umami sets no cookie and does not keep the IP address. The statistics are aggregated: page viewed, referring site, approximate location, language, device type, browser and operating system. To count visitors, Umami computes an anonymous identifier renewed every month, tied to no identity.",
            "A backup of these statistics is kept for at most 90 days by Cloudflare, Inc., on my behalf, in storage restricted to the European Union."
          ]
        },
        {
          heading: "Server logs",
          paragraphs: [
            "The server records the technical data of each connection: IP address, date, page requested and browser. It is used to deliver the pages and to protect the site against abuse, on the basis of my legitimate interest, and is deleted after 90 days. It is neither backed up nor shared."
          ]
        },
        {
          heading: "Your rights",
          paragraphs: [
            `You may access your data, have it corrected or erased, object to its processing, or ask for its restriction or portability, by writing to ${email}. If you believe your rights are not respected, you may lodge a complaint with the CNIL, the French data protection authority (www.cnil.fr).`
          ]
        }
      ]
    }
  ]
}
