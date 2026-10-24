import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Script from "next/script"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { name, siteUrl } from "@/content/site"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { fontVariables } from "@/lib/fonts"

import "@/app/globals.css"

// Umami on stats.jleveneur.com. The website ID is public: it ends up
// in the page anyway. `data-domains` keeps `next dev` and the e2e runs, which
// load the same script, from recording visits.
const UMAMI_SCRIPT_URL = "https://stats.jleveneur.com/script.js"
const UMAMI_WEBSITE_ID = "fdbed73e-0ec4-4ab7-902c-902d0244b0bf"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) {
    return {}
  }
  const dict = getDictionary(locale)
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${name} — ${dict.role}`, template: `%s — ${name}` },
    description: dict.meta.description,
    openGraph: { siteName: name, type: "website" }
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) {
    notFound()
  }
  const dict = getDictionary(locale)

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader locale={locale} dict={dict} />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} />
        <Script
          src={UMAMI_SCRIPT_URL}
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains="jleveneur.com"
        />
      </body>
    </html>
  )
}
