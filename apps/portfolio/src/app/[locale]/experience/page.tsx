import type { Metadata } from "next"
import type { ReactNode } from "react"

import { SectionHeading, Tag } from "@/components/drawing"
import { degrees, positions } from "@/content/experience"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"
import { formatPeriod } from "@/lib/period"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/experience">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return pageMetadata(locale, "/experience", {
    title: dict.experience.title,
    description: dict.experience.intro
  })
}

/** Two timelines drawn as vertical datum lines, each entry pinned to one. */
export default async function ExperiencePage({ params }: PageProps<"/[locale]/experience">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)

  return (
    <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
      <SectionHeading
        id="experience"
        code="B"
        level={1}
        title={dict.experience.title}
        intro={dict.experience.intro}
      />

      <section aria-labelledby="work" className="mt-20">
        <SectionHeading id="work" code="B.1" title={dict.experience.workTitle} />
        <Timeline>
          {positions.map((position) => (
            <Entry
              key={`${position.organization}-${position.start}`}
              period={formatPeriod(position, locale, dict.experience.present)}
              title={position.title[locale]}
              subtitle={[
                ...new Set([
                  position.organization,
                  position.contract[locale],
                  position.location[locale]
                ])
              ].join(" · ")}
              summary={position.summary[locale]}
              stack={position.stack}
            />
          ))}
        </Timeline>
      </section>

      <section aria-labelledby="education" className="mt-24">
        <SectionHeading id="education" code="B.2" title={dict.experience.educationTitle} />
        <Timeline>
          {degrees.map((degree) => (
            <Entry
              key={`${degree.school}-${degree.start}`}
              period={formatPeriod(degree, locale, dict.experience.present)}
              title={degree.degree[locale]}
              subtitle={degree.school}
              summary={degree.summary[locale]}
              stack={degree.stack ?? []}
            />
          ))}
        </Timeline>
      </section>
    </div>
  )
}

function Timeline({ children }: { children: ReactNode }) {
  return (
    <ol className="relative mt-12 grid gap-12 border-l border-line pl-8 sm:ml-5 sm:pl-12">
      {children}
    </ol>
  )
}

type EntryProps = {
  period: string
  title: string
  subtitle: string
  summary: string
  stack: string[]
}

function Entry({ period, title, subtitle, summary, stack }: EntryProps) {
  return (
    <li className="relative">
      <span
        aria-hidden="true"
        className="absolute top-1.5 -left-9.5 size-3 border border-ink bg-paper sm:-left-13.5"
      />
      <p className="font-mono text-sm text-signal">{period}</p>
      <h3 className="mt-2 font-stretch-75% text-3xl leading-none font-extrabold uppercase sm:text-4xl">
        {title}
      </h3>
      <p className="mt-2 font-mono text-sm tracking-wide text-ink-muted uppercase">{subtitle}</p>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{summary}</p>
      {stack.length === 0 ? null : (
        <ul className="mt-5 flex flex-wrap gap-2">
          {stack.map((tool) => (
            <li key={tool}>
              <Tag>{tool}</Tag>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
