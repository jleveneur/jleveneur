import { Archivo, Bangers } from "next/font/google"
import localFont from "next/font/local"

/**
 * Bangers is comic-book lettering, for headings and sound effects; it has a
 * single weight, so nothing that uses it asks for bold. Archivo sets the body
 * text. Next downloads both at build time and serves them from this origin.
 */
const bangers = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bangers",
  display: "swap"
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap"
})

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono"
})

export const fontVariables = `${bangers.variable} ${archivo.variable} ${geistMono.variable}`
