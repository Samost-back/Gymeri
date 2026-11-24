from datetime import time

import pytest

from gyms.exceptions import InvalidSchedule
from gyms.schedule import AccessWindow, PlanAccess

UNTIL_18 = AccessWindow(ends=time(18, 0))


@pytest.mark.parametrize(
    ("starts", "ends"),
    [(None, None), (time(18, 0), time(12, 0)), (time(12, 0), time(12, 0))],
    ids=["no bounds", "ends before start", "empty"],
)
def test_window_needs_a_bound_and_a_positive_length(starts, ends):
    with pytest.raises(InvalidSchedule):
        AccessWindow(starts, ends)


def test_unknown_weekday_is_rejected():
    with pytest.raises(InvalidSchedule):
        PlanAccess({7: UNTIL_18})


@pytest.mark.parametrize(
    ("days", "expected"),
    [
        ({}, ""),
        (dict.fromkeys(range(7), AccessWindow(time(12, 0), time(18, 0))), "Щодня 12:00–18:00"),
        (dict.fromkeys((0, 2, 4), UNTIL_18), "Пн, Ср, Пт до 18:00"),
        (
            {**dict.fromkeys(range(5), UNTIL_18), 5: AccessWindow(starts=time(10, 0))},
            "Пн–Пт до 18:00; Сб з 10:00",
        ),
    ],
    ids=["not limited", "every day", "separate days", "two windows"],
)
def test_summary_groups_days_with_the_same_window(days, expected):
    access = PlanAccess(days)

    assert access.summary() == expected
    assert access.is_limited is bool(days)
