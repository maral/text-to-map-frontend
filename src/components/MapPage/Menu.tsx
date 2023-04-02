import Link from "next/link";
import AboutLink from "./AboutLink";
import styles from "@/styles/MapPage.module.css";

interface MenuProps {
  moveLeft?: boolean;
}

export default function Menu({ moveLeft = false }: MenuProps) {
  return (
    <div className={`${styles.about} ${moveLeft ? styles.moveLeft : ""}`}>
      <div className={styles.tag}>menu</div>
      <ul className={styles.collapsed}>
        <li>
          <Link href="/embed">Vložit mapu na web</Link>
        </li>
        <AboutLink href="https://twitter.com/LisyMarek/status/1637777860181016581">
          Vlákno o projektu
        </AboutLink>
        <AboutLink href="praha.json">
          JSON s adresními místy ke stažení
        </AboutLink>
        <AboutLink
          href="mailto:marek.lisy.hk@gmai.com"
          prependText="Chcete mapu spádových oblastí i pro vaše město nebo nahlásit chybu?"
        >
          Napište mi
        </AboutLink>
        <li>
          <em>
            Projekt je financován{" "}
            <a href="https://www.praha.eu/jnp/" target="_blank">
              Magistrátem hl. m. Prahy
            </a>{" "}
            do 31. 3. 2024.
          </em>
        </li>
      </ul>
    </div>
  );
}
