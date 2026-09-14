import type { Metadata } from "next"

import { about, links, name, stack, tagline } from "@/lib/content.ts"

export const metadata: Metadata = {
  title: name,
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-[#f4f4f0] text-black [color-scheme:light]">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-16">
        <header className="border-4 border-black bg-[#ffe14d] p-6 shadow-[8px_8px_0_0_#000] sm:p-10">
          <p className="inline-block border-2 border-black bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-widest">
            Full-stack developer
          </p>
          <h1 className="mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
            {name}
          </h1>
          <p className="mt-6 max-w-xl border-l-4 border-black pl-4 text-base font-medium sm:text-lg">
            {tagline}
          </p>
        </header>

        <main className="mt-10 grid gap-10 sm:grid-cols-2">
          <section aria-labelledby="about-heading" className="sm:col-span-2">
            <h2
              id="about-heading"
              className="inline-block -rotate-1 border-2 border-black bg-[#ff90e8] px-3 py-1 text-lg font-black uppercase shadow-[4px_4px_0_0_#000]"
            >
              About
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {about.map((item, i) => (
                <li
                  key={item}
                  className="border-2 border-black bg-white p-5 shadow-[6px_6px_0_0_#000]"
                >
                  <span className="text-3xl font-black" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <p className="mt-3 text-sm font-medium leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="stack-heading">
            <h2
              id="stack-heading"
              className="inline-block rotate-1 border-2 border-black bg-[#7df9ff] px-3 py-1 text-lg font-black uppercase shadow-[4px_4px_0_0_#000]"
            >
              Stack
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {stack.map((tech) => (
                <li
                  key={tech}
                  className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold uppercase shadow-[3px_3px_0_0_#000]"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="connect-heading">
            <h2
              id="connect-heading"
              className="inline-block -rotate-1 border-2 border-black bg-[#98fb98] px-3 py-1 text-lg font-black uppercase shadow-[4px_4px_0_0_#000]"
            >
              Connect
            </h2>
            <nav aria-label="Contact links" className="mt-6 flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external === true
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group flex items-center justify-between border-2 border-black bg-white px-4 py-3 font-bold uppercase shadow-[4px_4px_0_0_#000] transition-[transform,box-shadow,background-color] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ffe14d] hover:shadow-[6px_6px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_0_#000]"
                >
                  {link.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          </section>
        </main>

        <footer className="mt-12 border-t-4 border-black pt-4">
          <p className="text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} — No cookies, no trackers, no nonsense.
          </p>
        </footer>
      </div>
    </div>
  )
}
