import Link from "next/link";
import { cx } from "@/shared/lib/classNames";
import { pluralize } from "@/shared/lib/format";
import { Icon, LinkSelect, type LinkSelectOption } from "@/shared/ui";
import { EMPTY_SEARCH, gymsHref } from "../../model/searchParams";
import {
  type FilterOption,
  type FilterOptions,
  type GymSearchParams,
  SORT_OPTIONS,
} from "../../model/types";
import { FilterSheet } from "./FilterSheet";
import styles from "./GymFilters.module.css";

type GymFiltersProps = {
  options: FilterOptions;
  params: GymSearchParams;
  // Null while the URL holds a filter the backend rejected.
  resultCount: number | null;
};

type ActiveFilter = {
  key: string;
  label: string;
  // The same search without this one filter.
  removeHref: string;
};

function toggle(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function nameOf(values: FilterOption[], slug: string | undefined): string {
  return values.find((value) => value.slug === slug)?.name ?? slug ?? "";
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

// What is switched on, each with a link that removes just it.
function activeFilters(options: FilterOptions, params: GymSearchParams): ActiveFilter[] {
  const active: (ActiveFilter | false)[] = [
    Boolean(params.street) && {
      key: "street",
      label: nameOf(options.streets, params.street),
      removeHref: gymsHref({ ...params, street: undefined }),
    },
    Boolean(params.chain) && {
      key: "chain",
      label: nameOf(options.chains, params.chain),
      removeHref: gymsHref({ ...params, chain: undefined }),
    },
    Boolean(params.audience) && {
      key: "audience",
      label: `Для: ${nameOf(options.audiences, params.audience).toLowerCase()}`,
      removeHref: gymsHref({ ...params, audience: undefined }),
    },
    ...params.types.map((slug) => ({
      key: `type-${slug}`,
      label: nameOf(options.types, slug),
      removeHref: gymsHref({ ...params, types: toggle(params.types, slug) }),
    })),
    params.promo && {
      key: "promo",
      label: "Є акція",
      removeHref: gymsHref({ ...params, promo: false }),
    },
    params.openNow && {
      key: "open-now",
      label: "Відкрито зараз",
      removeHref: gymsHref({ ...params, openNow: false }),
    },
  ];
  return active.filter((filter): filter is ActiveFilter => Boolean(filter));
}

// Filters are links, so the URL holds them; the label says whether a toggle is on, since
// checkbox and pressed states don't belong on links.
function stateLabel(name: string, on: boolean): string {
  return `${name}: ${on ? "увімкнено" : "вимкнено"}`;
}

// An on/off filter with a small checkbox, so it reads as a switch and not as a button.
function ToggleLink({ href, on, children }: { href: string; on: boolean; children: string }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={stateLabel(children, on)}
      className={cx(styles.toggle, on && styles.toggleOn)}
    >
      <span className={styles.checkbox}>{on && <Icon name="check" size={12} />}</span>
      {children}
    </Link>
  );
}

export function GymFilters({ options, params, resultCount }: GymFiltersProps) {
  const active = activeFilters(options, params);
  // Keeps the sort: it's an order, not a filter.
  const resetHref = gymsHref({ ...EMPTY_SEARCH, sort: params.sort });

  return (
    <section className={styles.filters} aria-label="Пошук залів">
      <div className={styles.toolbar}>
        <FilterSheet activeCount={active.length} resultCount={resultCount} resetHref={resetHref}>
          <div className={styles.controls}>
            <div className={styles.fields}>
              <div className={cx(styles.fieldRow, params.street && styles.fieldRowActive)}>
                <span className={styles.fieldLabel} aria-hidden="true">
                  Вулиця
                </span>
                <LinkSelect
                  id="filter-street"
                  label="Вулиця"
                  value={params.street ?? ""}
                  active={Boolean(params.street)}
                  options={selectOptions("Усі вулиці", options.streets, (street) =>
                    gymsHref({ ...params, street }),
                  )}
                />
              </div>
              <div className={cx(styles.fieldRow, params.chain && styles.fieldRowActive)}>
                <span className={styles.fieldLabel} aria-hidden="true">
                  Мережа
                </span>
                <LinkSelect
                  id="filter-chain"
                  label="Мережа"
                  value={params.chain ?? ""}
                  active={Boolean(params.chain)}
                  options={selectOptions("Усі мережі", options.chains, (chain) =>
                    gymsHref({ ...params, chain }),
                  )}
                />
              </div>
              <div className={cx(styles.fieldRow, params.audience && styles.fieldRowActive)}>
                <span className={styles.fieldLabel} aria-hidden="true">
                  Абонемент для
                </span>
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
            </div>

            <div className={styles.options}>
              <div className={styles.group} role="group" aria-labelledby="filter-types">
                <span id="filter-types" className={styles.groupLabel}>
                  Тип залу
                </span>
                <div className={styles.toggles}>
                  {options.types.map((gymType) => (
                    <ToggleLink
                      key={gymType.slug}
                      href={gymsHref({ ...params, types: toggle(params.types, gymType.slug) })}
                      on={params.types.includes(gymType.slug)}
                    >
                      {gymType.name}
                    </ToggleLink>
                  ))}
                </div>
              </div>

              <div className={styles.group} role="group" aria-labelledby="filter-extra">
                <span id="filter-extra" className={styles.groupLabel}>
                  Додатково
                </span>
                <div className={styles.toggles}>
                  <ToggleLink
                    href={gymsHref({ ...params, promo: !params.promo })}
                    on={params.promo}
                  >
                    Є акція
                  </ToggleLink>
                  <ToggleLink
                    href={gymsHref({ ...params, openNow: !params.openNow })}
                    on={params.openNow}
                  >
                    Відкрито зараз
                  </ToggleLink>
                </div>
              </div>
            </div>
          </div>
        </FilterSheet>

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

      <div className={styles.results}>
        {resultCount !== null && (
          <p className={styles.count} aria-live="polite">
            {pluralize(resultCount, { one: "зал", few: "зали", many: "залів" })}
          </p>
        )}
        {active.length > 0 && (
          <ul className={styles.activeList} aria-label="Увімкнені фільтри">
            {active.map((filter) => (
              <li key={filter.key}>
                <Link
                  href={filter.removeHref}
                  className={styles.activeChip}
                  scroll={false}
                  aria-label={`Прибрати фільтр: ${filter.label}`}
                >
                  {filter.label}
                  <Icon name="close" size={14} />
                </Link>
              </li>
            ))}
            <li>
              <Link href={resetHref} className={styles.reset} scroll={false}>
                Скинути все
              </Link>
            </li>
          </ul>
        )}
      </div>
    </section>
  );
}
