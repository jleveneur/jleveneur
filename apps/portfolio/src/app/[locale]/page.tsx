import type { Metadata } from "next"
import Link from "next/link"

import { ButtonLink } from "@/components/buttons"
import { DimensionLine, SectionHeading, Sheet, Tag } from "@/components/drawing"
import { ProjectCard } from "@/components/project-card"
import { StackSection } from "@/components/stack-section"
import { positions } from "@/content/experience"
import { projects } from "@/content/projects"
import { services } from "@/content/services"
import { name } from "@/content/site"
import { isLocale, type Locale, localePath } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"
import { formatPeriod } from "@/lib/period"

const LAYERS: Record<Locale, { name: string; tools: string }[]> = {
  fr: [
    { name: "Interface", tools: "React · Next.js · Tailwind" },
    { name: "API", tools: "oRPC · Node.js · Zod" },
    { name: "Données", tools: "PostgreSQL · Drizzle" },
    { name: "Infra", tools: "Docker · Caddy · Actions" }
  ],
  en: [
    { name: "Interface", tools: "React · Next.js · Tailwind" },
    { name: "API", tools: "oRPC · Node.js · Zod" },
    { name: "Data", tools: "PostgreSQL · Drizzle" },
    { name: "Infra", tools: "Docker · Caddy · Actions" }
  ]
}

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  return isLocale(locale) ? pageMetadata(locale, "/", {}) : {}
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)
  const featured = projects.filter((project) => project.featured)
  const [firstName = name, ...lastNames] = name.split(" ")

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-3 font-mono text-xs tracking-widest text-ink-muted uppercase">
              <span className="size-2 bg-signal" aria-hidden="true" />
              FIG. 00 — {dict.home.sheet}
            </p>
            <h1 className="mt-6 font-stretch-75% text-7xl leading-none font-extrabold tracking-tight uppercase sm:text-8xl lg:text-9xl">
              {firstName}
              <br />
              {lastNames.join(" ")}
            </h1>
            <div className="mt-6 max-w-md">
              <DimensionLine label={dict.role} />
            </div>
            <p className="mt-8 max-w-xl text-lg text-ink-muted">{dict.home.pitch}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href={localePath(locale, "/contact")}>{dict.home.primaryCta}</ButtonLink>
              <ButtonLink href={localePath(locale, "/projects")} variant="secondary">
                {dict.home.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <Sheet label={`FIG. 01 — ${dict.home.stackFigure}`}>
            <StackSection layers={LAYERS[locale]} label={dict.home.stackFigure} />
          </Sheet>
        </div>
      </section>

      <section aria-labelledby="services" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="services"
          code="01"
          title={dict.home.servicesTitle}
          intro={dict.home.servicesIntro}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <li
              key={service.code}
              className="flex flex-col border border-line-faint bg-paper-deep/40 p-6 transition-colors hover:border-ink"
            >
              <p className="flex items-center justify-between font-mono text-xs text-ink-muted">
                <span>{service.code}</span>
                <span aria-hidden="true" className="h-px w-12 bg-line" />
              </p>
              <h3 className="mt-6 font-stretch-75% text-3xl leading-none font-extrabold uppercase">
                {service.title[locale]}
              </h3>
              <p className="mt-3 flex-1 text-ink-muted">{service.body[locale]}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {service.tools.map((tool) => (
                  <li key={tool}>
                    <Tag>{tool}</Tag>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="projects" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="projects"
          code="02"
          title={dict.home.projectsTitle}
          intro={dict.home.projectsIntro}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              figure={projects.indexOf(project) + 2}
              locale={locale}
              figureLabel={dict.projects.figure}
            />
          ))}
          <Link
            href={localePath(locale, "/projects")}
            className="group hatch flex min-h-64 flex-col justify-end border border-dashed border-line p-6 transition-colors hover:border-signal"
          >
            <span className="font-mono text-xs text-ink-muted">
              {String(projects.length).padStart(2, "0")} / {dict.nav.projects}
            </span>
            <span className="mt-3 flex items-center justify-between font-stretch-75% text-3xl font-extrabold uppercase group-hover:text-signal">
              {dict.home.allProjects}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="experience" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="experience"
          code="03"
          title={dict.home.experienceTitle}
          intro={dict.home.experienceIntro}
        />
        <ol className="mt-10 border-t border-line">
          {positions.slice(0, 3).map((position) => (
            <li
              key={`${position.organization}-${position.start}`}
              className="grid gap-2 border-b border-line py-5 sm:grid-cols-[13rem_1fr_auto] sm:items-baseline sm:gap-6"
            >
              <span className="font-mono text-sm text-ink-muted">
                {formatPeriod(position, locale, dict.experience.present)}
              </span>
              <span>
                <span className="text-lg font-bold">{position.title[locale]}</span>
                <span className="text-ink-muted"> — {position.organization}</span>
              </span>
              <span className="font-mono text-xs text-ink-muted">{position.stack.join(" · ")}</span>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ButtonLink href={localePath(locale, "/experience")} variant="secondary">
            {dict.home.fullExperience}
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="cta" className="mx-auto mt-28 max-w-6xl px-4 sm:px-6">
        <div className="relative border border-ink corner-marks p-8 sm:p-14">
          <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">04 — Contact</p>
          <h2
            id="cta"
            className="mt-4 max-w-3xl font-stretch-75% text-4xl leading-none font-extrabold uppercase sm:text-6xl"
          >
            {dict.home.ctaTitle}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-ink-muted">{dict.home.ctaBody}</p>
          <div className="mt-8">
            <ButtonLink href={localePath(locale, "/contact")}>{dict.home.ctaButton}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
