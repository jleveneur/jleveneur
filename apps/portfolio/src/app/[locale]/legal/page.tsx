import type { Metadata } from "next"

import { SectionHeading } from "@/components/drawing"
import { legal, legalUpdated } from "@/content/legal"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/legal">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return pageMetadata(locale, "/legal", { title: dict.legal.title, description: dict.legal.intro })
}

export default async function LegalPage({ params }: PageProps<"/[locale]/legal">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)
  const updated = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${legalUpdated}T12:00:00Z`)
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
      <SectionHeading
        id="legal"
        code="§"
        level={1}
        title={dict.legal.title}
        intro={dict.legal.intro}
      />

      {legal[locale].map((part, index) => (
        <section key={part.id} id={part.id} aria-labelledby={`${part.id}-title`} className="mt-20">
          <SectionHeading
            id={`${part.id}-title`}
            code={`§${String(index + 1)}`}
            title={part.title}
          />
          <div className="mt-10 grid gap-x-12 gap-y-10 sm:pl-14 lg:grid-cols-2">
            {part.blocks.map((block) => (
              <section key={block.heading}>
                <h3 className="border-b border-line pb-3 font-stretch-75% text-2xl font-extrabold uppercase">
                  {block.heading}
                </h3>
                <div className="mt-4 grid gap-4 text-ink-muted">
                  {block.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ))}

      <p className="mt-20 font-mono text-xs tracking-widest text-ink-muted uppercase sm:pl-14">
        {dict.legal.updated} <time dateTime={legalUpdated}>{updated}</time>
      </p>
    </div>
  )
}
