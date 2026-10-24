import { notFound } from "next/navigation"

/** Any other path inside a locale, so it gets the localized not-found page. */
export default function UnknownPage() {
  notFound()
}
