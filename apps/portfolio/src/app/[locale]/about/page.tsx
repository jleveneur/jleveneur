import type { Metadata } from "next"

import { ButtonLink } from "@/components/buttons"
import { SectionHeading, Sheet } from "@/components/drawing"
import { RichText } from "@/components/rich-text"
import { intro, principles, stackGroups } from "@/content/about"
import { email, socialLinks } from "@/content/site"
import { isLocale, localePath } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return pageMetadata(locale, "/about", {
    title: dict.about.title,
    description: intro[locale][0] ?? dict.meta.description
  })
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
      <SectionHeading id="about" code="C" level={1} title={dict.about.title} />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6 text-lg text-ink-muted sm:pl-14">
          {intro[locale].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="mt-2">
            <ButtonLink href={localePath(locale, "/contact")}>{dict.nav.contact}</ButtonLink>
          </div>
        </div>
        <Sheet label={dict.about.elsewhere}>
          <ul className="grid gap-px bg-line-faint">
            {socialLinks.map((link) => (
              <li key={link.label} className="bg-paper-deep">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 p-4 hover:text-signal"
                >
                  <span className="font-bold uppercase">{link.label}</span>
                  <span className="font-mono text-sm text-ink-muted">{link.handle} ↗</span>
                </a>
              </li>
            ))}
            <li className="bg-paper-deep">
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-between gap-4 p-4 hover:text-signal"
              >
                <span className="font-bold uppercase">E-mail</span>
                <span className="font-mono text-sm break-all text-ink-muted">{email}</span>
              </a>
            </li>
          </ul>
        </Sheet>
      </div>

      <section aria-labelledby="principles" className="mt-28">
        <SectionHeading id="principles" code="C.1" title={dict.about.principlesTitle} />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {principles.map((principle, index) => (
            <li key={principle.title.en} className="border border-line-faint bg-paper-deep/40 p-6">
              <span className="font-mono text-xs text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-stretch-75% text-2xl leading-none font-extrabold uppercase">
                {principle.title[locale]}
              </h3>
              <p className="mt-3 text-ink-muted">
                <RichText text={principle.body[locale]} />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="stack" className="mt-28">
        <SectionHeading id="stack" code="C.2" title={dict.about.stackTitle} />
        <dl className="mt-10 border-t border-line">
          {stackGroups.map((group) => (
            <div
              key={group.title.en}
              className="grid gap-2 border-b border-line py-5 sm:grid-cols-[12rem_1fr] sm:gap-6"
            >
              <dt className="font-mono text-sm tracking-widest text-ink-muted uppercase">
                {group.title[locale]}
              </dt>
              <dd className="text-lg font-semibold">{group.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
