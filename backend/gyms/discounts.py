"""Temporary promotions on membership plans, in plain Python."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from .exceptions import InvalidDiscount

FULL_PERCENT = Decimal(100)
KOPECK = Decimal("0.01")


@dataclass(frozen=True)
class Discount(ABC):
    """A promotion that lowers a plan's price until `ends_on`, that day included.

    Subclasses differ only in how they lower the price, so pricing code works with any of them.
    """

    ends_on: date

    def is_active(self, on: date) -> bool:
        return on <= self.ends_on

    @abstractmethod
    def apply(self, price: Decimal) -> Decimal:
        """The discounted price; raises InvalidDiscount if this discount can't fit the price."""


@dataclass(frozen=True)
class PercentDiscount(Discount):
    percent: Decimal

    def __post_init__(self) -> None:
        if not 0 < self.percent <= FULL_PERCENT:
            raise InvalidDiscount(f"A percent discount must be within 0-100%, got {self.percent}.")

    def apply(self, price: Decimal) -> Decimal:
        discounted = price * (FULL_PERCENT - self.percent) / FULL_PERCENT
        return discounted.quantize(KOPECK, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class FixedDiscount(Discount):
    amount: Decimal

    def __post_init__(self) -> None:
        if self.amount <= 0:
            raise InvalidDiscount(f"A discount amount must be positive, got {self.amount}.")

    def apply(self, price: Decimal) -> Decimal:
        # Equal to the price would make the plan free, which is never what a promo means.
        if self.amount >= price:
            raise InvalidDiscount(f"A discount of {self.amount} doesn't fit the price {price}.")
        return price - self.amount


DISCOUNT_KINDS: dict[str, type[PercentDiscount] | type[FixedDiscount]] = {
    "percent": PercentDiscount,
    "fixed": FixedDiscount,
}


def make_discount(kind: str, value: Decimal, ends_on: date) -> Discount:
    """Factory: the stored kind code picks the class, so callers never branch on it."""
    try:
        discount_class = DISCOUNT_KINDS[kind]
    except KeyError:
        raise InvalidDiscount(f"Unknown discount kind: {kind}") from None
    return discount_class(ends_on, value)
