import Image from "next/image";
import { notFound } from "next/navigation";
import { formatArea } from "@/shared/lib/format";
import {
  ButtonLink,
  Icon,
  IconList,
  type IconListItem,
  PageHeader,
  PageHero,
  PageMain,
  Tag,
} from "@/shared/ui";
import { getGym } from "../../api/gyms";
import { type ChainLink, chainLinkOf, googleMapsPlaceUrl } from "../../model/mapLinks";
import { EMPTY_SEARCH, gymsHref } from "../../model/searchParams";
import type { GymProfile as GymProfileData } from "../../model/types";
import styles from "./GymProfile.module.css";
import { PlanCard } from "./PlanCard";
import { WeekHours } from "./WeekHours";

const CHAIN_LINK_LABELS: Record<ChainLink["kind"], string> = {
  website: "Сайт мережі",
  instagram: "Instagram мережі",
};

function facts(gym: GymProfileData): IconListItem[] {
  const items: IconListItem[] = [
    { icon: "pin_drop", title: gym.address, hint: "Луцьк" },
    {
      icon: "schedule",
      title: gym.hoursSummary || "Графік не вказано",
      hint: "Графік роботи",
      badge: gym.isOpenNow ? <Tag variant="solid">Відкрито</Tag> : undefined,
    },
  ];
  if (gym.phone) {
    items.push({ icon: "call", title: gym.phone, hint: "Телефон залу" });
  }
  if (gym.areaM2 !== null) {
    items.push({ icon: "domain", title: formatArea(gym.areaM2), hint: "Площа залу" });
  }
  return items;
}

type GymProfileProps = {
  // A promise, so the page renders its shell before the route params resolve.
  slug: Promise<string>;
};

export async function GymProfile({ slug }: GymProfileProps) {
  const gym = await getGym(await slug);
  if (!gym) {
    notFound();
  }
  const chainLink = chainLinkOf(gym);

  return (
    <>
      <PageHero
        title={gym.name}
        lead={gym.highlight || `Зал мережі ${gym.chainName} у Луцьку.`}
        action={
          <div className={styles.actions}>
            <ButtonLink href={googleMapsPlaceUrl(gym)} target="_blank" rel="noopener noreferrer">
              <Icon name="map" size={18} />
              Маршрут
            </ButtonLink>
            {gym.phone && (
              <ButtonLink href={`tel:${gym.phone}`} variant="outline">
                <Icon name="call" size={18} />
                Подзвонити
              </ButtonLink>
            )}
            {chainLink && (
              <ButtonLink
                href={chainLink.href}
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {CHAIN_LINK_LABELS[chainLink.kind]}
              </ButtonLink>
            )}
          </div>
        }
        aside={<IconList items={facts(gym)} label="Коротко про зал" />}
        photoFocus="60% center"
        compact
      />

      <PageMain spacing="sections">
        {gym.photos.length > 0 && (
          <div className={styles.photos}>
            {gym.photos.map((photo) => (
              <div key={photo.url} className={styles.photo}>
                <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" />
              </div>
            ))}
          </div>
        )}

        <section>
          <PageHeader
            title="Абонементи"
            description="Абонементи мережі діють у всіх її залах. Акційні продаються до вказаної дати."
          />
          {gym.plans.length > 0 ? (
            <div className={styles.plans}>
              {gym.plans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Мережа ще не опублікувала ціни для цього залу.</p>
          )}
          <div className={styles.sectionFooter}>
            <ButtonLink
              href={gymsHref({ ...EMPTY_SEARCH, chain: gym.chainSlug })}
              variant="outline"
            >
              Усі зали мережі
              <Icon name="arrow_forward" size={18} />
            </ButtonLink>
          </div>
        </section>

        <section>
          <PageHeader title="Графік і напрями" />
          <div className={styles.columns}>
            <WeekHours week={gym.week} />
            {gym.types.length > 0 && (
              <div className={styles.types}>
                <span className={styles.label}>Що є в залі</span>
                <div className={styles.tags}>
                  {gym.types.map((gymType) => (
                    <Tag key={gymType.slug}>{gymType.name}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </PageMain>
    </>
  );
}
