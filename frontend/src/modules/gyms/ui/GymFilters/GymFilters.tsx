import Link from "next/link";
import { pluralize } from "@/shared/lib/format";
import { Chip, Icon, type IconName, LinkSelect, type LinkSelectOption } from "@/shared/ui";
import { EMPTY_SEARCH, gymsHref } from "../../model/searchParams";
import {
  type FilterOption,
  type FilterOptions,
  type GymSearchParams,
  SORT_OPTIONS,
} from "../../model/types";
import styles from "./GymFilters.module.css";

// Icons are presentation, so they live here and not in the backend; unknown types get a check.
const TYPE_ICONS: Record<string, IconName> = {
  strength: "fitness_center",
  crossfit: "exercise",
  fitness: "sports_gymnastics",
  pool: "pool",
};

type GymFiltersProps = {
  options: FilterOptions;
  params: GymSearchParams;
  // Null while the URL holds a filter the backend rejected.
  resultCount: number | null;
};

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

// One select for a single-choice filter: "all" first, then every value the catalog has.
function selectOptions(
  allLabel: string,
  values: FilterOption[],
  hrefOf: (slug: string | undefined) => string,
): LinkSelectOption[] {
  return [
    { value: "", label: allLabel, href: hrefOf(undefined) },
    ...values.map((value) => ({ value: value.slug, label: value.name, href: hrefOf(value.slug) })),
  ];
}

function activeFilterCount(params: GymSearchParams): number {
  const singles = [
    params.street,
    params.chain,
    params.audience,
    params.discount,
    params.openNow,
  ];
  return singles.filter(Boolean).length + params.types.length;
}

export function GymFilters({ options, params, resultCount }: GymFiltersProps) {
  const activeCount = activeFilterCount(params);

  return (
    <section className={styles.panel} aria-label="Фільтри залів">
      <div className={styles.selects}>
        <LinkSelect
          id="filter-street"
          label="Вулиця"
          value={params.street ?? ""}
          active={Boolean(params.street)}
          options={selectOptions("Усі вулиці", options.streets, (street) =>
            gymsHref({ ...params, street }),
          )}
        />
        <LinkSelect
          id="filter-chain"
          label="Мережа"
          value={params.chain ?? ""}
          active={Boolean(params.chain)}
          options={selectOptions("Усі мережі", options.chains, (chain) =>
            gymsHref({ ...params, chain }),
          )}
        />
        <LinkSelect
          id="filter-audience"
          label="Абонемент для"
          value={params.audience ?? ""}
          active={Boolean(params.audience)}
          options={selectOptions("Для всіх", options.audiences, (audience) =>
            gymsHref({ ...params, audience }),
          )}
        />
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Тип залу</span>
        <div className={styles.chips}>
          {options.types.map((gymType) => (
            <Chip
              key={gymType.slug}
              icon={TYPE_ICONS[gymType.slug] ?? "check"}
              href={gymsHref({ ...params, types: toggle(params.types, gymType.slug) })}
              active={params.types.includes(gymType.slug)}
            >
              {gymType.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>Додатково</span>
        <div className={styles.chips}>
          <Chip
            icon="percent"
            href={gymsHref({ ...params, discount: !params.discount })}
            active={params.discount}
          >
            Є знижка
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

      <div className={styles.summary}>
        <div className={styles.found}>
          {resultCount !== null && (
            <span>
              Знайдено{" "}
              <strong>{pluralize(resultCount, { one: "зал", few: "зали", many: "залів" })}</strong>
            </span>
          )}
          {activeCount > 0 && (
            // Keeps the sort: it's an order, not a filter.
            <Link
              href={gymsHref({ ...EMPTY_SEARCH, sort: params.sort })}
              className={styles.reset}
              scroll={false}
            >
              <Icon name="restart_alt" size={16} />
              Скинути фільтри ({activeCount})
            </Link>
          )}
        </div>
        <div className={styles.sort}>
          <LinkSelect
            id="gym-sort"
            label="Сортування"
            value={params.sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option.code,
              label: option.label,
              href: gymsHref({ ...params, sort: option.code }),
            }))}
          />
        </div>
      </div>
    </section>
  );
}
