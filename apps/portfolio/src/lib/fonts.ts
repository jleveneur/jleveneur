import { Archivo } from "next/font/google"
import localFont from "next/font/local"

/**
 * Archivo carries a width axis: headings use its condensed cut, which reads
 * like the lettering on a technical drawing, and body text the normal one.
 * Next downloads it at build time and serves it from this origin.
 */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap"
})

const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono"
})

export const fontVariables = `${archivo.variable} ${geistMono.variable}`
