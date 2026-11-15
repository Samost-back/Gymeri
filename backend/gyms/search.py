"""Gym search rules in plain Python: validated criteria and interchangeable sort strategies."""

from abc import ABC, abstractmethod
from collections.abc import Mapping
from dataclasses import dataclass, field
from decimal import Decimal

from .exceptions import InvalidFilter


@dataclass(frozen=True)
class GymListing:
    """One gym as the filtered catalog shows it."""

    slug: str
    name: str
    chain_slug: str
    chain_name: str
    district: str
    address: str
    highlight: str
    area_m2: int | None
    amenities: list[str]
    hours_summary: str
    is_open_now: bool
    is_round_the_clock: bool
    price_from: Decimal | None
    photo_url: str | None


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
    district: str | None = None
    chain: str | None = None
    amenities: frozenset[str] = field(default_factory=frozenset)
    open_now: bool = False
    round_the_clock: bool = False
    sort: SortStrategy = SORT_STRATEGIES["name"]

    @classmethod
    def from_query(cls, params: Mapping[str, str], amenities: list[str]) -> "GymSearchCriteria":
        """Build criteria from URL query values; `amenities` comes separately as a list."""
        sort_code = params.get("sort", "name")
        if sort_code not in SORT_STRATEGIES:
            raise InvalidFilter(f"Unknown sort: {sort_code}")
        return cls(
            district=params.get("district") or None,
            chain=params.get("chain") or None,
            amenities=frozenset(amenities),
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

    def matches_schedule(self, listing: GymListing) -> bool:
        """Filters that need the computed schedule, so the database can't apply them."""
        if self.open_now and not listing.is_open_now:
            return False
        return not (self.round_the_clock and not listing.is_round_the_clock)
