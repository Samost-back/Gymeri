import { Chip, Icon, type IconName } from "@/shared/ui";
import { gymsHref } from "../../model/search-params";
import { SORT_OPTIONS, type FilterOptions, type GymSearchParams } from "../../model/types";
import styles from "./GymFilters.module.css";
import { SortSelect } from "./SortSelect";

// Icons are presentation, so they live here and not in the backend; unknown amenities get a check.
const AMENITY_ICONS: Record<string, IconName> = {
  strength: "fitness_center",
  pool: "pool",
};

type GymFiltersProps = {
  options: FilterOptions;
  params: GymSearchParams;
  showSort?: boolean;
};

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function GymFilters({ options, params, showSort = false }: GymFiltersProps) {
  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((option) => [option.code, gymsHref({ ...params, sort: option.code })]),
  );

  return (
    <section className={styles.panel} aria-label="Фільтри залів">
      <div className={styles.topRow}>
        <div className={styles.heading}>
          <Icon name="tune" size={16} className={styles.headingIcon} />
          Фільтрація та параметри відбору
        </div>
        {showSort && <SortSelect value={params.sort} hrefs={sortHrefs} />}
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>[Район]</span>
        <div className={styles.chips}>
          <Chip href={gymsHref({ ...params, district: undefined })} active={!params.district}>
            Всі райони
          </Chip>
          {options.districts.map((district) => (
            <Chip
              key={district.slug}
              href={gymsHref({ ...params, district: district.slug })}
              active={params.district === district.slug}
            >
              {district.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>[Опції]</span>
        <div className={styles.chips}>
          {options.amenities.map((amenity) => (
            <Chip
              key={amenity.slug}
              icon={AMENITY_ICONS[amenity.slug] ?? "check"}
              href={gymsHref({ ...params, amenities: toggle(params.amenities, amenity.slug) })}
              active={params.amenities.includes(amenity.slug)}
            >
              {amenity.name}
            </Chip>
          ))}
          <Chip
            icon="schedule"
            href={gymsHref({ ...params, roundTheClock: !params.roundTheClock })}
            active={params.roundTheClock}
          >
            24/7 режим
          </Chip>
          <Chip
            icon="timer"
            href={gymsHref({ ...params, openNow: !params.openNow })}
            active={params.openNow}
          >
            Відкрито зараз
          </Chip>
        </div>
      </div>
    </section>
  );
}
