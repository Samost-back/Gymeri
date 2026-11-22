"""Gym search rules in plain Python: validated criteria, filters as specifications and
interchangeable sort strategies."""

from abc import ABC, abstractmethod
from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field, replace
from decimal import Decimal

from .exceptions import InvalidFilter
from .pricing import DiscountOffer


@dataclass(frozen=True)
class Label:
    """A catalog value with its URL code and display name, e.g. ("pool", "Басейн")."""

    slug: str
    name: str


@dataclass(frozen=True)
class GymListing:
    """One gym as the filtered catalog shows it."""

    slug: str
    name: str
    chain_slug: str
    chain_name: str
    street: Label
    address: str
    highlight: str
    area_m2: int | None
    types: tuple[Label, ...]
    # Groups with a plan of their own in this gym, e.g. students.
    audiences: tuple[Label, ...]
    # The promotion with the biggest saving right now, or None.
    discount: DiscountOffer | None
    hours_summary: str
    is_open_now: bool
    is_round_the_clock: bool
    price_from: Decimal | None
    photo_url: str | None
    # False when the gym meets only part of a filter, e.g. one of two requested gym types.
    is_full_match: bool = True

    def has_type(self, slug: str) -> bool:
        return any(gym_type.slug == slug for gym_type in self.types)

    def has_audience(self, slug: str) -> bool:
        return any(audience.slug == slug for audience in self.audiences)


class GymFilter(ABC):
    """One condition of a search (Specification pattern).

    Criteria only hold a list of filters and ask each one, so a new filter is a new class,
    and the search code never changes.
    """

    @abstractmethod
    def accepts(self, gym: GymListing) -> bool:
        """Whether the gym stays in the results at all."""

    def is_full_match(self, gym: GymListing) -> bool:
        """Whether an accepted gym meets the filter completely. Most filters are all or
        nothing; ones a gym can meet partly override this."""
        return True


@dataclass(frozen=True)
class StreetFilter(GymFilter):
    slug: str

    def accepts(self, gym: GymListing) -> bool:
        return gym.street.slug == self.slug


@dataclass(frozen=True)
class ChainFilter(GymFilter):
    slug: str

    def accepts(self, gym: GymListing) -> bool:
        return gym.chain_slug == self.slug


@dataclass(frozen=True)
class GymTypeFilter(GymFilter):
    """Gym types like crossfit or pool. A gym with any of them is shown; one with all of
    them is a full match and goes first."""

    slugs: frozenset[str]

    def accepts(self, gym: GymListing) -> bool:
        return any(gym.has_type(slug) for slug in self.slugs)

    def is_full_match(self, gym: GymListing) -> bool:
        return all(gym.has_type(slug) for slug in self.slugs)


@dataclass(frozen=True)
class AudienceFilter(GymFilter):
    """Gyms with a plan for this group, e.g. a student plan."""

    slug: str

    def accepts(self, gym: GymListing) -> bool:
        return gym.has_audience(self.slug)


class DiscountFilter(GymFilter):
    def accepts(self, gym: GymListing) -> bool:
        return gym.discount is not None


class OpenNowFilter(GymFilter):
    def accepts(self, gym: GymListing) -> bool:
        return gym.is_open_now


class RoundTheClockFilter(GymFilter):
    def accepts(self, gym: GymListing) -> bool:
        return gym.is_round_the_clock


class SortStrategy(ABC):
    """One way to order search results; adding a new order means adding a class."""

    code: str

    @abstractmethod
    def sort(self, listings: list[GymListing]) -> list[GymListing]: ...


class SortByName(SortStrategy):
    code = "name"

    def sort(self, listings: list[GymListing]) -> list[GymListing]:
        return sorted(listings, key=lambda gym: gym.name.casefold())


class SortByPrice(SortStrategy):
    code = "price"

    def sort(self, listings: list[GymListing]) -> list[GymListing]:
        # Gyms without a published price go last instead of looking free.
        return sorted(
            listings, key=lambda gym: (gym.price_from is None, gym.price_from or 0, gym.name)
        )


class SortByArea(SortStrategy):
    code = "area"

    def sort(self, listings: list[GymListing]) -> list[GymListing]:
        return sorted(listings, key=lambda gym: (gym.area_m2 is None, -(gym.area_m2 or 0)))


SORT_STRATEGIES: dict[str, SortStrategy] = {
    strategy.code: strategy for strategy in (SortByName(), SortByPrice(), SortByArea())
}

TRUE_VALUES = {"true", "1"}
FALSE_VALUES = {"false", "0", ""}


@dataclass(frozen=True)
class GymSearchCriteria:
    street: str | None = None
    chain: str | None = None
    types: frozenset[str] = field(default_factory=frozenset)
    audience: str | None = None
    discount: bool = False
    open_now: bool = False
    round_the_clock: bool = False
    sort: SortStrategy = SORT_STRATEGIES["name"]

    @classmethod
    def from_query(cls, params: Mapping[str, str], types: list[str]) -> "GymSearchCriteria":
        """Build criteria from URL query values; `types` comes separately as a list."""
        sort_code = params.get("sort", "name")
        if sort_code not in SORT_STRATEGIES:
            raise InvalidFilter(f"Unknown sort: {sort_code}")
        return cls(
            street=params.get("street") or None,
            chain=params.get("chain") or None,
            types=frozenset(types),
            audience=params.get("audience") or None,
            discount=cls._parse_flag(params, "discount"),
            open_now=cls._parse_flag(params, "open_now"),
            round_the_clock=cls._parse_flag(params, "round_the_clock"),
            sort=SORT_STRATEGIES[sort_code],
        )

    @staticmethod
    def _parse_flag(params: Mapping[str, str], name: str) -> bool:
        value = params.get(name, "").lower()
        if value in TRUE_VALUES:
            return True
        if value in FALSE_VALUES:
            return False
        raise InvalidFilter(f"{name} must be true or false")

    def filters(self) -> list[GymFilter]:
        """Only the filters the user turned on; an empty list accepts every gym."""
        candidates: list[GymFilter | None] = [
            StreetFilter(self.street) if self.street else None,
            ChainFilter(self.chain) if self.chain else None,
            GymTypeFilter(self.types) if self.types else None,
            AudienceFilter(self.audience) if self.audience else None,
            DiscountFilter() if self.discount else None,
            OpenNowFilter() if self.open_now else None,
            RoundTheClockFilter() if self.round_the_clock else None,
        ]
        return [candidate for candidate in candidates if candidate]

    def apply(self, listings: Iterable[GymListing]) -> list[GymListing]:
        """Gyms every filter accepts, in the chosen order, with full matches before partial
        ones; within each group the sort order holds."""
        filters = self.filters()
        accepted = [gym for gym in listings if all(f.accepts(gym) for f in filters)]
        marked = [
            replace(gym, is_full_match=all(f.is_full_match(gym) for f in filters))
            for gym in self.sort.sort(accepted)
        ]
        # sorted() is stable, so moving partial matches down keeps the order inside each group.
        return sorted(marked, key=lambda gym: not gym.is_full_match)
