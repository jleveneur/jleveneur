import { about, links, name, stack, tagline } from "./content";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-heading">
          <h1 id="hero-heading" className={styles.name}>
            {name}
          </h1>
          <p className={styles.tagline}>{tagline}</p>
        </section>

        <section className={styles.section} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionTitle}>
            About
          </h2>
          <ul className={styles.aboutList}>
            {about.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="stack-heading">
          <h2 id="stack-heading" className={styles.sectionTitle}>
            Stack
          </h2>
          <ul className={styles.stackList}>
            {stack.map((tech) => (
              <li key={tech} className={styles.stackTag}>
                {tech}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="connect-heading">
          <h2 id="connect-heading" className={styles.sectionTitle}>
            Connect
          </h2>
          <nav className={styles.connectNav} aria-label="Contact links">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.connectLink}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </section>
      </main>
    </div>
  );
}
