"""Membership rules in plain Python: dates, visits and status, independent of storage and HTTP.

Every question takes the day from outside, so the rules don't depend on the clock and tests
can ask about any date.
"""

from abc import ABC, abstractmethod
from collections.abc import Iterable
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from enum import StrEnum

from .exceptions import InvalidTerms, VisitNotAllowed

# Warn this many days ahead, so there is time to buy the next one.
ENDING_SOON_DAYS = 7
# How far from today a start date may be: covers one bought long ago or well ahead, and keeps
# a typo like 2206 from becoming a membership nobody can use.
MAX_START_DISTANCE = timedelta(days=5 * 365)


class MembershipStatus(StrEnum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    ENDING_SOON = "ending_soon"
    USED_UP = "used_up"
    EXPIRED = "expired"


@dataclass(frozen=True)
class Period:
    starts_on: date
    duration_days: int

    def __post_init__(self) -> None:
        if self.duration_days <= 0:
            raise InvalidTerms("Абонемент має діяти хоча б один день.")
        if self.starts_on > date.max - timedelta(days=self.duration_days):
            # Otherwise ends_on overflows later, wherever it is first asked for.
            raise InvalidTerms("Абонемент закінчувався б за межами календаря.")

    @property
    def ends_on(self) -> date:
        """The last day it still works: a 30-day membership from the 1st ends on the 30th."""
        return self.starts_on + timedelta(days=self.duration_days - 1)

    def contains(self, day: date) -> bool:
        return self.starts_on <= day <= self.ends_on

    def days_left(self, day: date) -> int:
        """Days it can still be used, the given day included; all of them before the start."""
        if day < self.starts_on:
            return self.duration_days
        return max((self.ends_on - day).days + 1, 0)


def check_start(starts_on: date, today: date) -> None:
    """A new membership's start must be within a few years of today."""
    if abs(starts_on - today) > MAX_START_DISTANCE:
        raise InvalidTerms("Дата отримання має бути не далі ніж за п'ять років від сьогодні.")


class Membership(ABC):
    """What a client bought: terms copied from the gym's plan and the day it started.

    Subclasses differ in what they count. The status check is shared and asks each subclass
    whether it is used up before its dates run out.
    """

    def __init__(self, name: str, price: Decimal, period: Period) -> None:
        if not name.strip():
            raise InvalidTerms("Вкажіть назву абонемента.")
        if price < 0:
            raise InvalidTerms("Ціна не може бути від'ємною.")
        self.name = name
        self.price = price
        self.period = period

    def status(self, today: date) -> MembershipStatus:
        if today < self.period.starts_on:
            return MembershipStatus.UPCOMING
        if today > self.period.ends_on:
            return MembershipStatus.EXPIRED
        if self.is_used_up():
            return MembershipStatus.USED_UP
        if self.period.days_left(today) <= ENDING_SOON_DAYS:
            return MembershipStatus.ENDING_SOON
        return MembershipStatus.ACTIVE

    @abstractmethod
    def is_used_up(self) -> bool:
        """Whether nothing is left before the dates run out; each kind counts differently."""

    # Visits are part of every membership's interface, so callers never check the kind;
    # by default a membership doesn't count them, and a visit pack overrides all of these.
    @property
    def visits_limit(self) -> int | None:
        return None

    @property
    def visits_used(self) -> int | None:
        return None

    @property
    def visits_left(self) -> int | None:
        return None

    def has_visit_on(self, day: date) -> bool:
        return False

    def record_visit(self, day: date) -> None:
        raise VisitNotAllowed("Цей абонемент не рахує візитів.")

    def cancel_visit(self, day: date) -> None:
        raise VisitNotAllowed("Цей абонемент не рахує візитів.")


class UnlimitedMembership(Membership):
    """Any number of visits while its dates last; only the days are counted."""

    def is_used_up(self) -> bool:
        return False


class VisitPackMembership(Membership):
    """A fixed number of visits within its dates, e.g. 12 in a month; ends at whichever runs
    out first."""

    def __init__(
        self,
        name: str,
        price: Decimal,
        period: Period,
        visits_limit: int,
        visit_days: Iterable[date] = (),
    ) -> None:
        super().__init__(name, price, period)
        if visits_limit <= 0:
            raise InvalidTerms("Кількість візитів має бути більшою за нуль.")
        self._visits_limit = visits_limit
        self._visit_days = set(visit_days)

    @property
    def visits_limit(self) -> int:
        return self._visits_limit

    @property
    def visits_used(self) -> int:
        return len(self._visit_days)

    @property
    def visits_left(self) -> int:
        return max(self.visits_limit - self.visits_used, 0)

    def is_used_up(self) -> bool:
        return self.visits_left == 0

    def has_visit_on(self, day: date) -> bool:
        return day in self._visit_days

    def record_visit(self, day: date) -> None:
        if not self.period.contains(day):
            raise VisitNotAllowed("Візит можна відмітити лише в дні дії абонемента.")
        # One a day: a gym counts a day, and a second tap is almost always a mistake.
        if day in self._visit_days:
            raise VisitNotAllowed("Цей день уже відмічено.")
        if self.is_used_up():
            raise VisitNotAllowed("Усі візити вже використано.")
        self._visit_days.add(day)

    def cancel_visit(self, day: date) -> None:
        if day not in self._visit_days:
            raise VisitNotAllowed("Цього дня візиту не було.")
        self._visit_days.remove(day)


def make_membership(
    name: str,
    price: Decimal,
    period: Period,
    visits_limit: int | None,
    visit_days: Iterable[date] = (),
) -> Membership:
    """Picks the class by the terms, so callers never branch on the membership type."""
    if visits_limit is None:
        return UnlimitedMembership(name, price, period)
    return VisitPackMembership(name, price, period, visits_limit, visit_days)
