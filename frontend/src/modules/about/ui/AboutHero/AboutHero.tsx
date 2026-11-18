import { PageHero } from "@/shared/ui";
import { CatalogNumbers } from "../CatalogNumbers/CatalogNumbers";

export function AboutHero() {
  return (
    <PageHero
      title="Обрати зал"
      accent="має бути просто."
      lead="Ми збираємо спортзали Луцька в один каталог: адреси, графік роботи, опції й ціни абонементів. Без пошуку по соцмережах і дзвінків адміністратору."
      photoFocus="70% center"
      aside={<CatalogNumbers />}
    />
  );
}
