import { ButtonLink } from "@/components/buttons"
import { DimensionLine } from "@/components/drawing"
import { type Locale, localePath } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export function NotFoundSheet({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
        Erreur / Error 404
      </p>
      <h1 className="mt-4 font-stretch-75% text-6xl leading-none font-extrabold uppercase sm:text-8xl">
        {dict.notFound.title}
      </h1>
      <div className="mt-6 max-w-sm">
        <DimensionLine label="404" />
      </div>
      <p className="mt-8 max-w-xl text-lg text-ink-muted">{dict.notFound.body}</p>
      <div className="mt-10">
        <ButtonLink href={localePath(locale, "/")}>{dict.notFound.home}</ButtonLink>
      </div>
    </section>
  )
}
