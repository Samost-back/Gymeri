from datetime import date, timedelta
from decimal import Decimal

import pytest

from memberships.domain import (
    MAX_START_DISTANCE,
    MembershipStatus,
    Period,
    UnlimitedMembership,
    VisitPackMembership,
    check_start,
    make_membership,
)
from memberships.exceptions import InvalidTerms

DEC_1 = date(2026, 12, 1)
MONTH = Period(DEC_1, 30)


def test_last_day_is_inside_the_period():
    assert MONTH.ends_on == date(2026, 12, 30)
    assert MONTH.contains(date(2026, 12, 30))
    assert not MONTH.contains(date(2026, 12, 31))


def test_days_left_counts_today_and_stays_full_before_the_start():
    assert MONTH.days_left(date(2026, 11, 20)) == 30
    assert MONTH.days_left(DEC_1) == 30
    assert MONTH.days_left(date(2026, 12, 30)) == 1
    assert MONTH.days_left(date(2027, 1, 5)) == 0


@pytest.mark.parametrize(
    ("today", "status"),
    [
        (date(2026, 11, 30), MembershipStatus.UPCOMING),
        (DEC_1, MembershipStatus.ACTIVE),
        (date(2026, 12, 24), MembershipStatus.ENDING_SOON),
        (date(2026, 12, 30), MembershipStatus.ENDING_SOON),
        (date(2026, 12, 31), MembershipStatus.EXPIRED),
    ],
)
def test_status_follows_the_dates(today, status):
    membership = UnlimitedMembership("Безліміт", Decimal("900"), MONTH)

    assert membership.status(today) == status


@pytest.mark.parametrize(
    ("name", "price", "days", "visits"),
    [
        ("Безліміт", Decimal("900"), 0, None),
        ("  ", Decimal("900"), 30, None),
        ("Безліміт", Decimal("-1"), 30, None),
        ("12 візитів", Decimal("700"), 30, 0),
    ],
)
def test_impossible_terms_are_rejected(name, price, days, visits):
    with pytest.raises(InvalidTerms):
        make_membership(name, price, Period(DEC_1, days), visits)


@pytest.mark.parametrize("direction", [-1, 1])
def test_start_must_be_within_five_years_of_today(direction):
    check_start(DEC_1 + direction * MAX_START_DISTANCE, DEC_1)

    with pytest.raises(InvalidTerms):
        check_start(DEC_1 + direction * (MAX_START_DISTANCE + timedelta(days=1)), DEC_1)


def test_period_cannot_end_past_the_calendar():
    with pytest.raises(InvalidTerms):
        Period(date(9999, 12, 1), 31)


def test_factory_picks_the_class_by_the_visit_limit():
    assert isinstance(make_membership("Безліміт", Decimal("900"), MONTH, None), UnlimitedMembership)
    assert isinstance(make_membership("12 візитів", Decimal("700"), MONTH, 12), VisitPackMembership)
