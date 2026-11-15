import { ApiError } from "@/shared/lib/api";
import { getFilterOptions, searchGyms } from "../api/gyms";
import { parseSearchParams } from "../model/search-params";
import { GymCard } from "./GymCard/GymCard";
import { GymFilters } from "./GymFilters/GymFilters";
import styles from "./lists.module.css";

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

  return (
    <>
      <GymFilters options={options} params={params} showSort />
      {gyms === null && <p className={styles.empty}>Некоректні параметри фільтра.</p>}
      {gyms?.length === 0 && <p className={styles.empty}>За цими фільтрами залів не знайдено.</p>}
      {gyms && gyms.length > 0 && (
        <div className={styles.list}>
          {gyms.map((gym) => (
            <GymCard key={gym.slug} gym={gym} />
          ))}
        </div>
      )}
    </>
  );
}
