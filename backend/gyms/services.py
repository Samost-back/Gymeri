from dataclasses import dataclass
from decimal import Decimal

from django.db.models import Count, Min, Prefetch, Q

from .models import Chain, Gym

MONTH_DAYS = 30


@dataclass(frozen=True)
class CatalogStats:
    gyms: int
    chains: int
    districts: int


@dataclass(frozen=True)
class ChainCard:
    slug: str
    name: str
    short_name: str
    description: str
    logo_url: str | None
    locations_count: int
    districts: list[str]
    # Cheapest active monthly plan; None when the chain has not published monthly prices.
    price_from: Decimal | None


class CatalogService:
    """Read side of the public catalog: only published gyms and the chains that own them."""

    def get_stats(self) -> CatalogStats:
        totals = self._published_gyms().aggregate(
            gyms=Count("id"),
            chains=Count("chain", distinct=True),
            districts=Count("district", distinct=True),
        )
        return CatalogStats(**totals)

    def list_chains(self) -> list[ChainCard]:
        published = Q(gyms__is_published=True)
        monthly = Q(membership_plans__is_active=True, membership_plans__duration_days=MONTH_DAYS)
        chains = (
            Chain.objects.annotate(
                # distinct: joining gyms and plans at once multiplies rows.
                locations_count=Count("gyms", filter=published, distinct=True),
                price_from=Min("membership_plans__price", filter=monthly),
            )
            .filter(locations_count__gt=0)
            .prefetch_related(
                Prefetch(
                    "gyms",
                    queryset=self._published_gyms().select_related("district"),
                    to_attr="published_gyms",
                )
            )
        )
        return [self._to_card(chain) for chain in chains]

    @staticmethod
    def _published_gyms():
        return Gym.objects.filter(is_published=True)

    @staticmethod
    def _to_card(chain: Chain) -> ChainCard:
        return ChainCard(
            slug=chain.slug,
            name=chain.name,
            short_name=chain.short_name,
            description=chain.description,
            logo_url=chain.logo.url if chain.logo else None,
            locations_count=chain.locations_count,
            districts=sorted({gym.district.name for gym in chain.published_gyms}),
            price_from=chain.price_from,
        )
