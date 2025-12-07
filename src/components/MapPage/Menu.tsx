import Link from "next/link";
import AboutLink from "./AboutLink";
import styles from "@/styles/MapPage.module.css";

interface MenuProps {
  moveLeft?: boolean;
  year?: number;
}

export default function Menu({ moveLeft = false, year }: MenuProps) {
  return (
    <div className={`${styles.about} ${moveLeft ? styles.moveLeft : ""}`}>
      {year && (
        <div className={`${styles.tag} ${styles.year}`}>
          Vyhláška pro rok {year}
        </div>
      )}
      <div className={styles.tag}>menu</div>
      <ul className={styles.collapsed}>
        <li>
          <a href="/">Vyhláška 2026</a>
        </li>
        <li>
          <a href="/2025">Vyhláška 2025</a>
        </li>
        <li>
          <a href="/2024">Vyhláška 2024</a>
        </li>
        <li>
          <Link href="/embed">Vložit mapu na web</Link>
        </li>
        <AboutLink href="praha2026.json">
          JSON s adresními místy ke stažení
        </AboutLink>
        <AboutLink
          href="mailto:marek.lisy.hk@gmail.com"
          prependText="Chcete mapu spádových oblastí škol i pro vaše město nebo nahlásit chybu?"
        >
          Napište mi
        </AboutLink>
        <li>
          <em>
            Projekt je financován{" "}
            <a href="https://www.praha.eu/jnp/" target="_blank">
              Magistrátem hl. m. Prahy
            </a>{" "}
            do 15. 1. 2027.
          </em>
        </li>
      </ul>
    </div>
  );
}
