import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { DimensionLine, Sheet, Tag } from "@/components/drawing"
import { RichText } from "@/components/rich-text"
import { SchematicFigure } from "@/components/schematic"
import { findProject, projects } from "@/content/projects"
import { isLocale, localePath, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"

export function generateStaticParams() {
  return locales.flatMap((locale) => projects.map((project) => ({ locale, slug: project.slug })))
}

export async function generateMetadata({
  params
}: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params
  const project = findProject(slug)
  if (!isLocale(locale) || project === undefined) {
    return {}
  }
  return pageMetadata(locale, `/projects/${slug}`, {
    title: project.title,
    description: project.summary[locale]
  })
}

export default async function ProjectPage({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { locale: param, slug } = await params
  const project = findProject(slug)
  if (!isLocale(param) || project === undefined) {
    notFound()
  }
  const locale = param
  const dict = getDictionary(locale)
  const index = projects.indexOf(project)
  const next = projects[(index + 1) % projects.length] ?? project
  const figure = `FIG. ${String(index + 1).padStart(2, "0")}`

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-16">
      <Link
        href={localePath(locale, "/projects")}
        className="font-mono text-xs tracking-widest text-ink-muted uppercase hover:text-signal"
      >
        ← {dict.projects.back}
      </Link>

      <header className="mt-8 grid gap-6">
        <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
          {figure} — {project.kind[locale]}
        </p>
        <h1 className="font-stretch-75% text-6xl leading-none font-extrabold tracking-tight uppercase sm:text-8xl">
          {project.title}
        </h1>
        <div className="max-w-md">
          <DimensionLine label={project.year} />
        </div>
        <p className="max-w-3xl text-xl text-ink-muted">{project.summary[locale]}</p>
      </header>

      <div className="mt-12">
        <Sheet label={`${figure} — ${dict.projects.figure}`}>
          <div className="mx-auto max-w-3xl">
            <SchematicFigure
              locale={locale}
              schematic={project.schematic}
              label={`${dict.projects.figure} — ${project.title}`}
            />
          </div>
        </Sheet>
      </div>

      <dl
        className={
          project.links.length === 0
            ? "mt-12 grid gap-px border border-ink bg-line-faint sm:grid-cols-3"
            : "mt-12 grid gap-px border border-ink bg-line-faint sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        <Spec label={dict.projects.year}>{project.year}</Spec>
        <Spec label={dict.projects.role}>{project.role[locale]}</Spec>
        <Spec label={dict.projects.stack}>
          <span className="flex flex-wrap gap-1.5">
            {project.stack.map((tool) => (
              <Tag key={tool}>{tool}</Tag>
            ))}
          </span>
        </Spec>
        {project.links.length === 0 ? null : (
          <Spec label={dict.projects.links}>
            <span className="flex flex-col gap-1">
              {project.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 hover:text-signal hover:underline"
                >
                  {link.label} ↗
                </a>
              ))}
            </span>
          </Spec>
        )}
      </dl>

      <div className="mt-16 grid gap-12 lg:grid-cols-3">
        <Block code="01" title={dict.projects.context}>
          <p className="text-lg text-ink-muted">{project.context[locale]}</p>
        </Block>
        <Block code="02" title={dict.projects.built}>
          <List items={project.built[locale]} />
        </Block>
        <Block code="03" title={dict.projects.decisions}>
          <List items={project.decisions[locale]} />
        </Block>
      </div>

      <Link
        href={localePath(locale, `/projects/${next.slug}`)}
        className="group mt-20 flex items-end justify-between gap-6 border-t border-line pt-8"
      >
        <span>
          <span className="block font-mono text-xs tracking-widest text-ink-muted uppercase">
            {dict.projects.next}
          </span>
          <span className="mt-2 block font-stretch-75% text-4xl font-extrabold uppercase group-hover:text-signal sm:text-5xl">
            {next.title}
          </span>
        </span>
        <span aria-hidden="true" className="text-4xl group-hover:text-signal">
          →
        </span>
      </Link>
    </article>
  )
}

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-paper p-5">
      <dt className="font-mono text-xs tracking-widest text-ink-muted uppercase">{label}</dt>
      <dd className="mt-2 font-semibold">{children}</dd>
    </div>
  )
}

function Block({ code, title, children }: { code: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-3 border-b border-line pb-3 font-stretch-75% text-2xl font-extrabold uppercase">
        <span className="font-mono text-xs font-normal text-ink-muted">{code}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-ink-muted">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 bg-signal" />
          <span>
            <RichText text={item} />
          </span>
        </li>
      ))}
    </ul>
  )
}
