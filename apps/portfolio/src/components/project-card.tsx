import Link from "next/link"

import { Tag } from "@/components/drawing"
import { SchematicFigure } from "@/components/schematic"
import type { Project } from "@/content/projects"
import { type Locale, localePath } from "@/i18n/config"

type ProjectCardProps = {
  project: Project
  figure: number
  locale: Locale
  figureLabel: string
}

/** The whole card is the link, through the title's stretched hit area. */
export function ProjectCard({ project, figure, locale, figureLabel }: ProjectCardProps) {
  return (
    <article className="group relative flex flex-col border-3 border-ink bg-paper-raised shadow-panel transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-panel-lg">
      <div className="relative overflow-hidden border-b-3 border-ink p-5 sm:p-6">
        <span aria-hidden="true" className="absolute inset-0 halftone fade-out opacity-20" />
        <div className="relative">
          <SchematicFigure
            locale={locale}
            schematic={project.schematic}
            label={`${figureLabel} — ${project.title}`}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between font-mono text-xs font-semibold text-ink-muted">
          <span>Nº {String(figure).padStart(2, "0")}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="mt-3 font-display text-4xl leading-none tracking-wide uppercase">
          <Link
            href={localePath(locale, `/projects/${project.slug}`)}
            className="after:absolute after:inset-0 group-hover:text-signal"
          >
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 font-mono text-xs tracking-wide text-ink-muted uppercase">
          {project.kind[locale]}
        </p>
        <p className="mt-4 flex-1 text-ink-muted">{project.summary[locale]}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.stack.slice(0, 5).map((tool) => (
            <li key={tool}>
              <Tag>{tool}</Tag>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
