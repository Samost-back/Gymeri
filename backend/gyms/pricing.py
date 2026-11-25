"""Price rules in plain Python, kept in one place so cards and search can't disagree."""

from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date
from decimal import ROUND_HALF_UP, Decimal

from .exceptions import InvalidPlan, InvalidPromo
from .schedule import PlanAccess

MONTH_DAYS = 30
HRYVNIA = Decimal("1")


@dataclass(frozen=True)
class PlanPrice:
    price: Decimal
    duration_days: int
    # None means the plan works in every gym of the chain.
    gym_id: int | None = None
    # Who may buy it, e.g. {"students"}; empty means everyone.
    audiences: frozenset[str] = field(default_factory=frozenset)
    name: str = ""
    # None means unlimited visits during the period.
    visits_limit: int | None = None
    access: PlanAccess = field(default_factory=lambda: PlanAccess({}))
    # A promo is a plan of its own, e.g. "3 months for 1500"; gyms rarely discount plans.
    is_promo: bool = False
    # The last day a promo is sold; None means until the chain removes it.
    promo_ends_on: date | None = None

    def __post_init__(self) -> None:
        # The database checks this too, but monthly_price divides by it, so the class guards itself.
        if self.duration_days <= 0:
            raise InvalidPlan(f"A plan must last at least a day, got {self.duration_days}.")
        if self.promo_ends_on is not None and not self.is_promo:
            raise InvalidPromo("Only a promo plan can have an end date.")

    @property
    def is_for_everyone(self) -> bool:
        return not self.audiences

    @property
    def monthly_price(self) -> Decimal:
        """The price spread over 30 days, so "3 months for 1500" compares with a month for 900."""
        return (self.price * MONTH_DAYS / self.duration_days).quantize(
            HRYVNIA, rounding=ROUND_HALF_UP
        )

    def is_sold_on(self, day: date) -> bool:
        """Regular plans are always sold; a promo only until its last day, that day included."""
        return self.promo_ends_on is None or day <= self.promo_ends_on


class PriceList:
    """Active plans of one chain; answers price questions for the chain or one of its gyms.

    Every question takes the day, because a promo that ended yesterday is no longer sold.
    """

    def __init__(self, plans: Iterable[PlanPrice] = ()) -> None:
        self._plans = tuple(plans)

    def monthly_from(self, day: date, gym_id: int | None = None) -> Decimal | None:
        """Cheapest monthly plan that day, promos included. For a gym, only chain-wide plans
        and its own plans count. Plans for students and other groups don't: "from" must be a
        price anyone pays."""
        prices = [
            plan.price
            for plan in self._sold_in(day, gym_id)
            if plan.duration_days == MONTH_DAYS and plan.is_for_everyone
        ]
        return min(prices, default=None)

    def best_promo(self, day: date, gym_id: int | None = None) -> PlanPrice | None:
        """The promo worth showing on a card: one anyone can buy before one for a group, such
        as a newcomer trial that most visitors can't get; then the lowest price per month."""
        promos = [plan for plan in self._sold_in(day, gym_id) if plan.is_promo]
        return min(
            promos, key=lambda plan: (not plan.is_for_everyone, plan.monthly_price), default=None
        )

    def audiences(self, day: date, gym_id: int | None = None) -> frozenset[str]:
        """Groups with a plan of their own, e.g. a gym with a student plan lists "students"."""
        return frozenset().union(*(plan.audiences for plan in self._sold_in(day, gym_id)))

    def plans_for(self, day: date, gym_id: int) -> list[PlanPrice]:
        """Plans sold in this gym that day: ones anyone can buy before those for special
        groups, promos first within each, then shorter terms and cheaper ones first."""
        return sorted(
            self._sold_in(day, gym_id),
            key=lambda plan: (
                not plan.is_for_everyone,
                not plan.is_promo,
                plan.duration_days,
                plan.price,
            ),
        )

    def _sold_in(self, day: date, gym_id: int | None) -> list[PlanPrice]:
        return [
            plan
            for plan in self._plans
            if plan.is_sold_on(day) and (gym_id is None or plan.gym_id in (None, gym_id))
        ]
