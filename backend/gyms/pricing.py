"""Price rules in plain Python, kept in one place so cards and search can't disagree."""

from collections.abc import Iterable
from dataclasses import dataclass
from decimal import Decimal

MONTH_DAYS = 30


@dataclass(frozen=True)
class PlanPrice:
    price: Decimal
    duration_days: int
    # None means the plan works in every gym of the chain.
    gym_id: int | None = None


class PriceList:
    """Active plans of one chain; answers "from what price" for the chain or one of its gyms."""

    def __init__(self, plans: Iterable[PlanPrice] = ()) -> None:
        self._plans = tuple(plans)

    def monthly_from(self, gym_id: int | None = None) -> Decimal | None:
        """Cheapest monthly price. For a gym, only chain-wide plans and its own plans count."""
        prices = [
            plan.price
            for plan in self._plans
            if plan.duration_days == MONTH_DAYS and self._sold_in(plan, gym_id)
        ]
        return min(prices, default=None)

    @staticmethod
    def _sold_in(plan: PlanPrice, gym_id: int | None) -> bool:
        return gym_id is None or plan.gym_id in (None, gym_id)
