import { ButtonLink } from "@/components/buttons"
import { Burst, Caption } from "@/components/drawing"
import { type Locale, localePath } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export function NotFoundSheet({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="font-mono text-xs tracking-widest text-ink-muted uppercase">
        Erreur / Error 404
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <h1 className="font-display text-7xl leading-none tracking-wide uppercase text-shadow-pop sm:text-9xl">
          {dict.notFound.title}
        </h1>
        <Burst>Poof!</Burst>
      </div>
      <div className="mt-6">
        <Caption label="404" />
      </div>
      <p className="mt-8 max-w-xl text-lg text-ink-muted">{dict.notFound.body}</p>
      <div className="mt-10">
        <ButtonLink href={localePath(locale, "/")}>{dict.notFound.home}</ButtonLink>
      </div>
    </section>
  )
}
