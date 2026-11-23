from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal

from django.db.models import Count, Prefetch, Q, QuerySet
from django.utils import timezone

from .discounts import make_discount
from .exceptions import GymNotPublishable, InvalidDiscount, InvalidFilter
from .geo import GeoPoint
from .models import Audience, Chain, Gym, GymType, MembershipPlan, Street
from .pricing import PlanPrice, PriceList
from .schedule import TimeInterval, WeeklySchedule
from .search import GymListing, GymSearchCriteria, Label


def load_price_lists(chain_ids: set[int]) -> dict[int, PriceList]:
    """Active plans of all given chains with their audiences and discounts, grouped into a
    PriceList per chain; three queries however many chains there are."""
    plans: dict[int, list[PlanPrice]] = defaultdict(list)
    rows = MembershipPlan.objects.filter(chain__in=chain_ids, is_active=True).prefetch_related(
        "audiences", "discounts"
    )
    for plan in rows:
        plans[plan.chain_id].append(
            PlanPrice(
                plan.price,
                plan.duration_days,
                plan.gym_id,
                audiences=frozenset(audience.slug for audience in plan.audiences.all()),
                discounts=tuple(
                    make_discount(d.kind, d.value, d.ends_on) for d in plan.discounts.all()
                ),
                name=plan.name,
            )
        )
    return {chain_id: PriceList(plans[chain_id]) for chain_id in chain_ids}


@dataclass(frozen=True)
class CatalogStats:
    gyms: int
    chains: int
    streets: int


@dataclass(frozen=True)
class FilterOption:
    slug: str
    name: str


@dataclass(frozen=True)
class FilterOptions:
    streets: list[FilterOption]
    chains: list[FilterOption]
    types: list[FilterOption]
    audiences: list[FilterOption]


@dataclass(frozen=True)
class ChainCard:
    slug: str
    name: str
    short_name: str
    description: str
    logo_url: str | None
    locations_count: int
    streets: list[str]
    # Cheapest active monthly plan; None when the chain has not published monthly prices.
    price_from: Decimal | None


@dataclass(frozen=True)
class MapPoint:
    slug: str
    name: str
    chain_name: str
    # Only chains have these links; each is empty when the chain has none.
    website: str
    instagram_url: str
    address: str
    location: GeoPoint


class CatalogService:
    """Read side of the public catalog: only published gyms and the chains that own them."""

    def get_stats(self) -> CatalogStats:
        totals = self._published_gyms().aggregate(
            gyms=Count("id"),
            chains=Count("chain", distinct=True),
            streets=Count("street", distinct=True),
        )
        return CatalogStats(**totals)

    def get_filter_options(self) -> FilterOptions:
        """Only values that lead to at least one published gym, so no filter returns nothing."""
        # One filter() call, so the plan conditions apply to the same plan row: an active plan
        # sold chain-wide by a chain with published gyms, or sold in a published gym.
        audiences = Audience.objects.filter(
            Q(plans__is_active=True)
            & (
                Q(plans__gym__isnull=True, plans__chain__gyms__is_published=True)
                | Q(plans__gym__is_published=True)
            )
        )
        return FilterOptions(
            streets=self._options(Street.objects.filter(gyms__is_published=True)),
            chains=self._options(Chain.objects.filter(gyms__is_published=True)),
            types=self._options(GymType.objects.filter(gyms__is_published=True)),
            audiences=self._options(audiences),
        )

    def list_chains(self) -> list[ChainCard]:
        chains = list(
            Chain.objects.annotate(locations_count=Count("gyms", filter=Q(gyms__is_published=True)))
            .filter(locations_count__gt=0)
            .prefetch_related(
                Prefetch(
                    "gyms",
                    queryset=self._published_gyms().select_related("street"),
                    to_attr="published_gyms",
                )
            )
        )
        prices = load_price_lists({chain.pk for chain in chains})
        return [self._to_card(chain, prices[chain.pk]) for chain in chains]

    def list_map_points(self) -> list[MapPoint]:
        # The published_gym_has_location constraint guarantees every one of them has a point.
        gyms = self._published_gyms().select_related("chain", "street")
        return [
            MapPoint(
                slug=gym.slug,
                name=gym.name,
                chain_name=gym.chain.name,
                website=gym.chain.website,
                instagram_url=gym.chain.instagram_url,
                address=gym.address,
                location=GeoPoint(gym.latitude, gym.longitude),
            )
            for gym in gyms
        ]

    @staticmethod
    def _published_gyms() -> QuerySet[Gym]:
        return Gym.objects.filter(is_published=True)

    @staticmethod
    def _options(queryset: QuerySet) -> list[FilterOption]:
        return [FilterOption(slug=o.slug, name=o.name) for o in queryset.distinct()]

    @staticmethod
    def _to_card(chain: Chain, prices: PriceList) -> ChainCard:
        return ChainCard(
            slug=chain.slug,
            name=chain.name,
            short_name=chain.short_name,
            description=chain.description,
            logo_url=chain.logo.url if chain.logo else None,
            locations_count=chain.locations_count,
            streets=sorted({gym.street.name for gym in chain.published_gyms}),
            price_from=prices.monthly_from(timezone.localdate()),
        )


class GymSearchService:
    """Finds published gyms by criteria.

    Loads every published gym and lets the domain filters decide: a city catalog holds
    dozens of gyms, and filters like "open now" or "has a discount" need computed values
    the database doesn't have anyway.
    """

    def search(self, criteria: GymSearchCriteria, now: datetime | None = None) -> list[GymListing]:
        self._ensure_known(criteria)
        now = timezone.localtime(now)
        gyms = list(
            Gym.objects.filter(is_published=True)
            .select_related("chain", "street")
            .prefetch_related("types", "opening_hours", "photos")
        )
        prices = load_price_lists({gym.chain_id for gym in gyms})
        audience_names = dict(Audience.objects.values_list("slug", "name"))
        listings = [
            self._to_listing(gym, prices[gym.chain_id], audience_names, now) for gym in gyms
        ]
        return criteria.apply(listings)

    @staticmethod
    def _ensure_known(criteria: GymSearchCriteria) -> None:
        """A hand-edited URL with an unknown value is an error, not a silently empty list."""
        checks: list[tuple[type[Street] | type[Chain] | type[Audience], str | None, str]] = [
            (Street, criteria.street, "street"),
            (Chain, criteria.chain, "chain"),
            (Audience, criteria.audience, "audience"),
        ]
        for model, slug, name in checks:
            if slug and not model.objects.filter(slug=slug).exists():
                raise InvalidFilter(f"Unknown {name}: {slug}")
        known = set(GymType.objects.filter(slug__in=criteria.types).values_list("slug", flat=True))
        if unknown := criteria.types - known:
            raise InvalidFilter(f"Unknown gym types: {sorted(unknown)}")

    @staticmethod
    def _to_listing(
        gym: Gym, prices: PriceList, audience_names: dict[str, str], now: datetime
    ) -> GymListing:
        schedule = WeeklySchedule(
            {
                hours.weekday: TimeInterval(hours.opens_at, hours.closes_at)
                for hours in gym.opening_hours.all()
            }
        )
        photos = list(gym.photos.all())
        today = now.date()
        return GymListing(
            slug=gym.slug,
            name=gym.name,
            chain_slug=gym.chain.slug,
            chain_name=gym.chain.name,
            street=Label(gym.street.slug, gym.street.name),
            address=gym.address,
            highlight=gym.highlight,
            area_m2=gym.area_m2,
            types=tuple(Label(t.slug, t.name) for t in gym.types.all()),
            audiences=tuple(
                Label(slug, audience_names[slug]) for slug in sorted(prices.audiences(gym.pk))
            ),
            discount=prices.best_offer(today, gym.pk),
            hours_summary=schedule.summary(),
            is_open_now=schedule.is_open_at(now),
            price_from=prices.monthly_from(today, gym.pk),
            photo_url=photos[0].image.url if photos else None,
        )


class GymPublishingService:
    """Rules a gym must pass before it appears in the public catalog."""

    def validate(
        self, *, is_published: bool, latitude: Decimal | None, longitude: Decimal | None
    ) -> None:
        location = GeoPoint.from_optional(latitude, longitude)
        if is_published and location is None:
            raise GymNotPublishable("A published gym needs a map location.")


class PlanPricingService:
    """Checks a promotion against the plan it lowers before it is saved."""

    def validate_discount(
        self, *, price: Decimal, kind: str, value: Decimal, ends_on: date, today: date
    ) -> None:
        if ends_on < today:
            raise InvalidDiscount("A new discount can't end in the past.")
        make_discount(kind, value, ends_on).apply(price)
