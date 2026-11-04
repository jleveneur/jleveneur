import type { Metadata } from "next"
import Link from "next/link"

import { ButtonLink } from "@/components/buttons"
import { Eye, Smiley } from "@/components/doodles"
import { Burst, Caption, Panel, SectionHeading, Tag } from "@/components/drawing"
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
      <section className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
        <span
          aria-hidden="true"
          className="absolute -top-64 -left-72 -z-10 size-240 speed-lines opacity-15"
        />
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-3 font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
              <span className="size-2.5 rounded-full bg-signal" aria-hidden="true" />
              Nº 00 — {dict.home.sheet}
            </p>
            <div className="relative mt-6">
              <h1 className="font-display text-8xl leading-none tracking-wide uppercase text-shadow-pop sm:text-9xl">
                {firstName}
                <br />
                {lastNames.join(" ")}
              </h1>
              <div className="absolute -top-10 right-0 hidden sm:block lg:-right-6">
                <Burst>{dict.home.sound}</Burst>
              </div>
            </div>
            <div className="mt-6">
              <Caption label={dict.role} />
            </div>
            <p className="mt-8 max-w-xl text-lg text-ink-muted">{dict.home.pitch}</p>
            <div className="mt-10 flex flex-wrap gap-5">
              <ButtonLink href={localePath(locale, "/contact")}>{dict.home.primaryCta}</ButtonLink>
              <ButtonLink href={localePath(locale, "/projects")} variant="secondary">
                {dict.home.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <div className="relative">
            <Eye className="absolute -top-14 -right-2 z-10 w-20 rotate-6" />
            <Smiley className="absolute -bottom-12 -left-6 z-10 w-16 -rotate-12" />
            <Panel label={`Nº 01 — ${dict.home.stackFigure}`}>
              <StackSection layers={LAYERS[locale]} label={dict.home.stackFigure} />
            </Panel>
          </div>
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
              className="flex flex-col border-3 border-ink bg-paper-raised p-6 shadow-panel"
            >
              <p className="flex items-center gap-3 font-mono text-xs font-semibold text-ink-muted">
                <span>{service.code}</span>
                <span aria-hidden="true" className="h-1 w-12 bg-ink" />
              </p>
              <h3 className="mt-6 font-display text-4xl leading-none tracking-wide uppercase">
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
            className="group relative flex min-h-64 flex-col justify-end overflow-hidden border-3 border-dashed border-ink p-6 transition-colors hover:bg-ink hover:text-paper"
          >
            <span aria-hidden="true" className="absolute inset-0 halftone fade-out opacity-25" />
            <span className="relative font-mono text-xs font-semibold">
              {String(projects.length).padStart(2, "0")} / {dict.nav.projects}
            </span>
            <span className="relative mt-3 flex items-center justify-between font-display text-4xl tracking-wide uppercase">
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
        <ol className="mt-10 border-t-3 border-ink">
          {positions.slice(0, 3).map((position) => (
            <li
              key={`${position.organization}-${position.start}`}
              className="grid gap-2 border-b-2 border-ink py-5 sm:grid-cols-[13rem_1fr_auto] sm:items-baseline sm:gap-6"
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
        <div className="relative overflow-hidden border-3 border-ink bg-paper-raised p-8 shadow-panel-lg sm:p-14">
          <span
            aria-hidden="true"
            className="absolute top-1/2 -right-1/4 aspect-square w-3/4 -translate-y-1/2 speed-lines opacity-20"
          />
          <span aria-hidden="true" className="absolute inset-0 halftone fade-out opacity-10" />
          <p className="relative font-mono text-xs font-semibold tracking-widest text-ink-muted uppercase">
            Nº 04 — Contact
          </p>
          <h2
            id="cta"
            className="relative mt-4 max-w-3xl font-display text-5xl leading-none tracking-wide uppercase text-shadow-pop sm:text-7xl"
          >
            {dict.home.ctaTitle}
          </h2>
          <p className="relative mt-6 max-w-xl text-lg text-ink-muted">{dict.home.ctaBody}</p>
          <div className="relative mt-8">
            <ButtonLink href={localePath(locale, "/contact")}>{dict.home.ctaButton}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
