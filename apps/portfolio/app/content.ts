export type Link = {
  label: string;
  href: string;
  external?: boolean;
};

export const name = "Julien Leveneur";

export const tagline =
  "Full-stack developer building web apps with TypeScript and React.";

export const about = [
  "Building web projects and sharpening my full-stack skills",
  "Interested in modern front-end tooling, APIs, and clean architecture",
  "Happy to chat about TypeScript, React, Node.js, or web dev in general",
];

export const stack = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "NestJS",
  "PostgreSQL",
  "Docker",
];

export const links: Link[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/jleveneur",
    external: true,
  },
  {
    label: "Email",
    href: "mailto:jleveneur.pro@gmail.com",
  },
  {
    label: "X",
    href: "https://x.com/jleveneur_",
    external: true,
  },
];
