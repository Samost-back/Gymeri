import Image from "next/image";
import gymPhoto from "@/shared/assets/gym-photo.webp";
import { PageHero } from "@/shared/ui";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  return (
    <PageHero
      status="Gymeri // Про сервіс"
      title="Обрати зал"
      accent="має бути просто."
      lead="Ми збираємо спортзали Луцька в один каталог: адреси, графік роботи, опції й ціни абонементів. Без пошуку по соцмережах і дзвінків адміністратору."
      aside={
        <figure className={styles.photo}>
          <Image
            src={gymPhoto}
            alt=""
            fill
            placeholder="blur"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className={styles.image}
          />
          <figcaption className={styles.caption}>Луцьк · тренувальні локації</figcaption>
        </figure>
      }
    />
  );
}
