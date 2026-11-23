"""Price rules in plain Python, kept in one place so cards and search can't disagree."""

from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal

from .discounts import Discount
from .exceptions import InvalidDiscount

MONTH_DAYS = 30


@dataclass(frozen=True)
class DiscountOffer:
    """A promotion as a buyer sees it: which plan, how much off, the price before and after."""

    plan_name: str
    discount: Discount
    full_price: Decimal
    price: Decimal

    @property
    def saving(self) -> Decimal:
        return self.full_price - self.price


@dataclass(frozen=True)
class PlanPrice:
    price: Decimal
    duration_days: int
    # None means the plan works in every gym of the chain.
    gym_id: int | None = None
    # Who may buy it, e.g. {"students"}; empty means everyone.
    audiences: frozenset[str] = field(default_factory=frozenset)
    discounts: tuple[Discount, ...] = ()
    name: str = ""

    @property
    def is_for_everyone(self) -> bool:
        return not self.audiences

    def best_offer_on(self, day: date) -> DiscountOffer | None:
        """The active discount that saves the most that day, or None."""
        offers = []
        for discount in self.discounts:
            if not discount.is_active(day):
                continue
            # The admin checks a discount against the price, but the price may drop later;
            # a discount that no longer fits is skipped instead of breaking the catalog.
            try:
                offers.append(
                    DiscountOffer(self.name, discount, self.price, discount.apply(self.price))
                )
            except InvalidDiscount:
                continue
        return max(offers, key=lambda offer: offer.saving, default=None)

    def price_on(self, day: date) -> Decimal:
        """The price a buyer pays that day: with the best active discount, or the full price."""
        offer = self.best_offer_on(day)
        return offer.price if offer else self.price


class PriceList:
    """Active plans of one chain; answers price questions for the chain or one of its gyms."""

    def __init__(self, plans: Iterable[PlanPrice] = ()) -> None:
        self._plans = tuple(plans)

    def monthly_from(self, day: date, gym_id: int | None = None) -> Decimal | None:
        """Cheapest monthly price that day. For a gym, only chain-wide plans and its own plans
        count. Plans for students and other groups don't: "from" must be a price anyone pays."""
        prices = [
            plan.price_on(day)
            for plan in self._sold_in(gym_id)
            if plan.duration_days == MONTH_DAYS and plan.is_for_everyone
        ]
        return min(prices, default=None)

    def best_offer(self, day: date, gym_id: int | None = None) -> DiscountOffer | None:
        """The promotion worth showing on a card: the biggest saving among the gym's plans."""
        offers = [offer for plan in self._sold_in(gym_id) if (offer := plan.best_offer_on(day))]
        return max(offers, key=lambda offer: offer.saving, default=None)

    def audiences(self, gym_id: int | None = None) -> frozenset[str]:
        """Groups with a plan of their own, e.g. a gym with a student plan lists "students"."""
        return frozenset().union(*(plan.audiences for plan in self._sold_in(gym_id)))

    def _sold_in(self, gym_id: int | None) -> list[PlanPrice]:
        return [plan for plan in self._plans if gym_id is None or plan.gym_id in (None, gym_id)]
