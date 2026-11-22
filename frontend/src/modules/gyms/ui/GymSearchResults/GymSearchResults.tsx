import { ApiError } from "@/shared/lib/api";
import { getFilterOptions, searchGyms } from "../../api/gyms";
import { parseSearchParams } from "../../model/searchParams";
import type { GymListing } from "../../model/types";
import { GymCard } from "../GymCard/GymCard";
import { GymFilters } from "../GymFilters/GymFilters";
import styles from "../lists.module.css";

type GymSearchResultsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function GymSearchResults({ searchParams }: GymSearchResultsProps) {
  const params = parseSearchParams(await searchParams);
  const [options, gyms] = await Promise.all([
    getFilterOptions(),
    // A hand-edited URL with an unknown filter gets a message instead of an error page.
    searchGyms(params).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 400) {
        return null;
      }
      throw error;
    }),
  ]);
  // The backend already puts full matches first; this only splits them under headings.
  const fullMatches = gyms?.filter((gym) => gym.isFullMatch) ?? [];
  const partialMatches = gyms?.filter((gym) => !gym.isFullMatch) ?? [];

  const cards = (list: GymListing[]) => (
    <div className={styles.list}>
      {list.map((gym) => (
        <GymCard key={gym.slug} gym={gym} selectedTypes={params.types} />
      ))}
    </div>
  );

  return (
    <>
      <GymFilters options={options} params={params} resultCount={gyms?.length ?? null} />
      {gyms === null && <p className={styles.empty}>Некоректні параметри фільтра.</p>}
      {gyms?.length === 0 && <p className={styles.empty}>За цими фільтрами залів не знайдено.</p>}
      {fullMatches.length > 0 && cards(fullMatches)}
      {partialMatches.length > 0 && (
        <section className={styles.partial} aria-labelledby="partial-matches">
          <h3 id="partial-matches" className={styles.partialTitle}>
            Мають лише частину обраних типів
          </h3>
          {cards(partialMatches)}
        </section>
      )}
    </>
  );
}
