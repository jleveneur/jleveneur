import type { Metadata } from "next"

import { ContactForm } from "@/components/contact-form"
import { SectionHeading, Sheet } from "@/components/drawing"
import { SchematicFigure } from "@/components/schematic"
import { email, socialLinks } from "@/content/site"
import { isLocale, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"
import type { Schematic } from "@/lib/schematic"

/** Where a message goes once sent, drawn like everything else here. */
const ROUTE: Record<Locale, Schematic> = {
  fr: route(["Formulaire", "Serveur", "Resend", "Ma boîte"]),
  en: route(["Form", "Server", "Resend", "My inbox"])
}

function route(labels: [string, string, string, string]): Schematic {
  return {
    width: 320,
    height: 236,
    nodes: labels.map((label, index) => ({
      id: String(index),
      label,
      x: 4,
      y: 4 + index * 64,
      w: 312,
      h: 36,
      ...(index === 2 ? { tone: "accent" as const } : {})
    })),
    edges: [0, 1, 2].map((index) => ({ from: String(index), to: String(index + 1) }))
  }
}

export async function generateMetadata({
  params
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return pageMetadata(locale, "/contact", {
    title: dict.contact.title,
    description: dict.contact.intro
  })
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
      <SectionHeading
        id="contact"
        code="D"
        level={1}
        title={dict.contact.title}
        intro={dict.contact.intro}
      />

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <Sheet label="FORM-01">
          <ContactForm dict={dict.contact.form} />
        </Sheet>

        <aside className="grid content-start gap-10">
          <div className="grid gap-4">
            <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
              FIG. — {dict.contact.title}
            </p>
            <SchematicFigure locale={locale} schematic={ROUTE[locale]} label={dict.contact.title} />
          </div>

          <div>
            <h2 className="border-b border-line pb-3 font-stretch-75% text-2xl font-extrabold uppercase">
              {dict.contact.otherChannels}
            </h2>
            <ul className="divide-y divide-line-faint">
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center justify-between gap-4 py-4 hover:text-signal"
                >
                  <span className="font-bold uppercase">E-mail</span>
                  <span className="font-mono text-sm break-all text-ink-muted">{email}</span>
                </a>
              </li>
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 py-4 hover:text-signal"
                  >
                    <span className="font-bold uppercase">{link.label}</span>
                    <span className="font-mono text-sm text-ink-muted">{link.handle} ↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
