import type { Metadata } from "next"

import { SectionHeading } from "@/components/drawing"
import { ProjectCard } from "@/components/project-card"
import { projects } from "@/content/projects"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({
  params
}: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return pageMetadata(locale, "/projects", {
    title: dict.projects.title,
    description: dict.projects.intro
  })
}

export default async function ProjectsPage({ params }: PageProps<"/[locale]/projects">) {
  const { locale: param } = await params
  const locale = isLocale(param) ? param : "fr"
  const dict = getDictionary(locale)

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-20">
      <SectionHeading
        id="projects"
        code="A"
        level={1}
        title={dict.projects.title}
        intro={dict.projects.intro}
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            figure={index + 1}
            locale={locale}
            figureLabel={dict.projects.figure}
          />
        ))}
      </div>
    </section>
  )
}
