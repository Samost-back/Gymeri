from datetime import date, timedelta
from decimal import Decimal

import pytest

from memberships.domain import (
    MembershipStatus,
    Period,
    UnlimitedMembership,
    VisitPackMembership,
)
from memberships.exceptions import VisitNotAllowed

DEC_1 = date(2026, 12, 1)


def pack(limit: int = 3, visit_days: tuple[date, ...] = ()) -> VisitPackMembership:
    return VisitPackMembership("3 візити", Decimal("400"), Period(DEC_1, 30), limit, visit_days)


def test_visits_count_down():
    membership = pack()

    membership.record_visit(DEC_1)

    assert membership.visits_used == 1
    assert membership.visits_left == 2
    assert membership.has_visit_on(DEC_1)


def test_unlimited_membership_does_not_count_visits():
    membership = UnlimitedMembership("Безліміт", Decimal("900"), Period(DEC_1, 30))

    assert membership.visits_left is None
    with pytest.raises(VisitNotAllowed):
        membership.record_visit(DEC_1)


def test_last_visit_ends_the_membership_before_its_dates():
    membership = pack(limit=2, visit_days=(DEC_1,))

    membership.record_visit(DEC_1 + timedelta(days=1))

    assert membership.status(DEC_1 + timedelta(days=2)) == MembershipStatus.USED_UP
    with pytest.raises(VisitNotAllowed):
        membership.record_visit(DEC_1 + timedelta(days=3))


def test_one_visit_a_day():
    with pytest.raises(VisitNotAllowed):
        pack(visit_days=(DEC_1,)).record_visit(DEC_1)


@pytest.mark.parametrize("day", [date(2026, 11, 30), date(2026, 12, 31)])
def test_no_visits_outside_the_dates(day):
    with pytest.raises(VisitNotAllowed):
        pack().record_visit(day)


def test_expired_wins_over_used_up():
    membership = pack(limit=1, visit_days=(DEC_1,))

    assert membership.status(date(2027, 1, 1)) == MembershipStatus.EXPIRED


def test_a_mistaken_visit_can_be_cancelled():
    membership = pack(limit=1, visit_days=(DEC_1,))

    membership.cancel_visit(DEC_1)

    assert membership.visits_left == 1
    assert membership.status(DEC_1) == MembershipStatus.ACTIVE
    with pytest.raises(VisitNotAllowed):
        membership.cancel_visit(DEC_1)
